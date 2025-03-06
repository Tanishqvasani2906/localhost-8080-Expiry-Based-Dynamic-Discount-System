package com.example.Expiry_Based_Dynamic_Discount_System.Service;

import com.example.Expiry_Based_Dynamic_Discount_System.Entity.*;
import com.example.Expiry_Based_Dynamic_Discount_System.Repository.DiscountCalculationLogRepository;
import com.example.Expiry_Based_Dynamic_Discount_System.Repository.DiscountHistoryRepository;
import com.example.Expiry_Based_Dynamic_Discount_System.Repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class DiscountService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private DiscountCalculationLogRepository discountCalculationLogRepository;

    @Autowired
    private DiscountHistoryRepository discountHistoryRepository;

    // 🔹 Calculates and applies discount for a product
//
    public BigDecimal calculateAndApplyDiscount(Product product) {
        BigDecimal discountedPrice;

        // ✅ If it's an event product, use event-specific discount logic
        if (product.getProductCategory() == ProductCategory.EVENT) {
            discountedPrice = calculateEventDiscount(product);
        } else {
            BigDecimal discountScore = calculateDiscountScore(product);
            BigDecimal discountPercentage = getDiscountPercentage(discountScore);

            BigDecimal discountAmount = product.getBasePrice()
                    .multiply(discountPercentage)
                    .divide(BigDecimal.valueOf(100), 2, BigDecimal.ROUND_HALF_UP);

            discountedPrice = product.getBasePrice().subtract(discountAmount);
        }

        // 🔹 Fetch last discount history entry to avoid unnecessary writes
        DiscountHistory lastHistory = discountHistoryRepository.findLatestDiscountByProduct(product.getProduct_id());

        // 🔹 Ensure we only update if discount changed
        if (lastHistory == null || lastHistory.getDiscountedPrice().compareTo(discountedPrice) != 0) {

            DiscountHistory discountHistory = new DiscountHistory();
            discountHistory.setProduct(product);
            discountHistory.setDiscountPercentage(BigDecimal.ZERO); // Not needed for event-based pricing
            discountHistory.setOriginalPrice(product.getBasePrice());
            discountHistory.setDiscountedPrice(discountedPrice);
            discountHistory.setAppliedAt(LocalDateTime.now());
            discountHistory.setAppliedBy("System");

            discountHistoryRepository.save(discountHistory);
        }

        //  Debug log to confirm correct price
        System.out.println("DEBUG: Final Discounted Price Being Saved = " + discountedPrice);

        return discountedPrice;
    }

    //    public BigDecimal calculateAndApplyDiscount(Product product) {
//        BigDecimal discountScore = calculateDiscountScore(product);
//        BigDecimal discountPercentage = getDiscountPercentage(discountScore);
//
//        BigDecimal discountAmount = product.getBasePrice()
//                .multiply(discountPercentage)
//                .divide(BigDecimal.valueOf(100), 2, BigDecimal.ROUND_HALF_UP);
//
//        BigDecimal discountedPrice = product.getBasePrice().subtract(discountAmount);
//
//        // 🔹 Fetch last discount history entry using correct product ID to avoid mismatches
//        DiscountHistory lastHistory = discountHistoryRepository.findLatestDiscountByProduct(product.getProduct_id()); // ✅ FIXED: Used correct product reference
//
//        // 🔹 Ensure we only update if there is a change in discount percentage or price
//        if (lastHistory == null || lastHistory.getDiscountPercentage().compareTo(discountPercentage) != 0
//                || lastHistory.getDiscountedPrice().compareTo(discountedPrice) != 0) { // ✅ FIXED: Also check price change
//
//            DiscountHistory discountHistory = new DiscountHistory();
//            discountHistory.setProduct(product);
//            discountHistory.setDiscountPercentage(discountPercentage);
//            discountHistory.setOriginalPrice(product.getBasePrice());
//            discountHistory.setDiscountedPrice(discountedPrice); // ✅ Ensure latest price is saved
//            discountHistory.setAppliedAt(LocalDateTime.now());
//            discountHistory.setAppliedBy("System");
//
//            discountHistoryRepository.save(discountHistory);
//        }
//
//        // ✅ Debug log to confirm the correct price is being saved
//        System.out.println("DEBUG: Final Discounted Price Being Saved = " + discountedPrice);
//
//        return discountedPrice;
//    }


    // 🔹 Determines discount score based on product type
    private BigDecimal calculateDiscountScore(Product product) {
        switch (product.getProductCategory()) {
            case PERISHABLE:
                return calculatePerishableDiscount(product);
            case EVENT:
                return calculateEventDiscount(product);
            case SUBSCRIPTION:
                return calculateSubscriptionDiscount(product);
            case SEASONAL:
                return calculateSeasonalDiscount(product);
            default:
                return BigDecimal.ZERO;
        }
    }

    private BigDecimal calculatePerishableDiscount(Product product) {
        PerishableGood perishableGood = product.getPerishableGood();
        if (perishableGood == null) return BigDecimal.ZERO;

        //  Expiry Time Score
        long daysToExpiry = java.time.temporal.ChronoUnit.DAYS.between(
                LocalDate.now(), perishableGood.getExpiryDate()
        );
        BigDecimal expiryTimeScore = BigDecimal.ONE.subtract(
                new BigDecimal(daysToExpiry)
                        .divide(new BigDecimal(perishableGood.getMaxShelfLife()), 2, BigDecimal.ROUND_HALF_UP)
        );

        //  Demand Trend Score
        BigDecimal demandTrendScore = BigDecimal.ONE.subtract(
                new BigDecimal(String.valueOf(perishableGood.getCurrentDemandLevel()))
                        .divide(new BigDecimal("100"), 2, BigDecimal.ROUND_HALF_UP)
        );

        //  Stock Clearance Factor (SCF)
        BigDecimal scf = BigDecimal.ZERO;
        if (daysToExpiry > 0 && perishableGood.getCurrentDailySellingRate().compareTo(BigDecimal.ZERO) > 0) {
            scf = new BigDecimal(product.getCurrentStock()).divide(
                    new BigDecimal(daysToExpiry).multiply(new BigDecimal(String.valueOf(perishableGood.getCurrentDailySellingRate()))),
                    2, BigDecimal.ROUND_HALF_UP
            );
        }
        BigDecimal scfNormalized = scf.divide(new BigDecimal("5"), 2, BigDecimal.ROUND_HALF_UP);

        //  Final Discount Score Calculation (Adjusted Weights)
        BigDecimal discountScore = expiryTimeScore.multiply(new BigDecimal("0.4"))
                .add(demandTrendScore.multiply(new BigDecimal("0.3")))
                .add(scfNormalized.multiply(new BigDecimal("0.3")));

        return discountScore;
    }

    private BigDecimal calculateEventDiscount(Product product) {
        // Constants
        final long EARLY_BIRD_THRESHOLD = 30; // Days for early bird discount
        final long SURGE_THRESHOLD = 7;       // Days for price increase

        // Get linked EventProduct
        EventProduct event = product.getEventProduct();
        if (event == null) {
            throw new IllegalArgumentException("No event associated with this product");
        }

        // Current time
        LocalDateTime now = LocalDateTime.now();
        long daysLeft = ChronoUnit.DAYS.between(now.toLocalDate(), event.getEventDate().toLocalDate());

        // Base price and bounds
        BigDecimal basePrice = product.getBasePrice();
        BigDecimal minPrice = event.getMinTicketPrice();
        BigDecimal maxPrice = event.getMaxTicketPrice();
        BigDecimal price = basePrice;

        // Debugging Log
        System.out.println("DEBUG: Base Price = " + basePrice);
        System.out.println("DEBUG: Days Left = " + daysLeft);

        //  Corrected Early Bird Discount (40% Discount)
        if (daysLeft > EARLY_BIRD_THRESHOLD) {
            price = basePrice.multiply(BigDecimal.valueOf(0.8)); // 40% discount (was 20% before)
            System.out.println("DEBUG: Early Bird Discount Applied (40%)");
        }
        //  Neutral zone (7-30 days): No Change
        else if (daysLeft > SURGE_THRESHOLD) {
            System.out.println("DEBUG: No Discount Applied (Neutral Zone)");
        }
        //  Surge Pricing (< 7 days): Increase price from 20% to 40%
        else {
            double surgeFactor = 1.2 + (0.2 * (SURGE_THRESHOLD - daysLeft) / (double) SURGE_THRESHOLD);
            price = basePrice.multiply(BigDecimal.valueOf(surgeFactor));
            System.out.println("DEBUG: Surge Pricing Applied, Factor = " + surgeFactor);
        }

        price = price.max(minPrice).min(maxPrice);

        System.out.println("DEBUG: Final Price After Discount = " + price);

        return price.setScale(2, BigDecimal.ROUND_HALF_UP);
    }





//    private BigDecimal calculateSubscriptionDiscount(Product product) {
//        if (product == null || product.getProductCategory() == null || product.getProductCategory() != ProductCategory.SUBSCRIPTION) {
//            return BigDecimal.ZERO; // No discount for non-subscription products
//        }
//
//        SubscriptionService subscription = product.getSubscriptionService();
//        if (subscription == null) {
//            return BigDecimal.ZERO; // No discount if no subscription details available
//        }
//
//        double discount = 0.0;
//
//        // Base discount based on renewal rate
//        if (subscription.getRenewalRate() > 0.7) {
//            discount += 5.0;
//        } else if (subscription.getRenewalRate() > 0.5) {
//            discount += 10.0;
//        } else {
//            discount += 15.0;
//        }
//
//        // Additional discount if many subscribers have expired
//        int daysSinceExpiry = subscription.getStandardDurationDays() + subscription.getGracePeriodDays() - subscription.getActiveSubscribers();
//        if (daysSinceExpiry > subscription.getGracePeriodDays()) {
//            discount += 10.0;
//        }
//
//        // Encourage renewals for services with fewer active subscribers
//        if (subscription.getActiveSubscribers() < (subscription.getTotalSubscribers() * 0.3)) {
//            discount += 10.0;
//        }
//
//        // Ensuring discount doesn't exceed 50%
//        return BigDecimal.valueOf(Math.min(discount, 50.0));
//    }
private BigDecimal calculateSubscriptionDiscount(Product product) {
    if (product == null || product.getProductCategory() == null || product.getProductCategory() != ProductCategory.SUBSCRIPTION) {
        return BigDecimal.ZERO; // No discount for non-subscription products
    }

    SubscriptionService subscription = product.getSubscriptionService();
    if (subscription == null) {
        return BigDecimal.ZERO; // No discount if no subscription details available
    }

    // User behavior parameters (normalized 0-1)
    double renewalProbability = calculateRenewalProbability(subscription);
    double engagementLevel = calculateEngagementLevel(subscription);
    double timeSinceExpiry = calculateTimeSinceExpiry(subscription);
    double totalRenewalsNormalized = normalizeRenewals(subscription);
    double discountSensitivity = calculateDiscountSensitivity(subscription);

    // Determine user segment for logging and future feature expansion
    String userSegment = determineUserSegment(renewalProbability, engagementLevel,
            totalRenewalsNormalized, discountSensitivity);

    // Final discount score calculation using the formula from the design
    // Discount Score = (1-R) × (T) × (w1×E + w2×D)
    double w1 = 0.6; // Weight for engagement
    double w2 = 0.4; // Weight for discount sensitivity

    double discountScore = (1 - renewalProbability) * timeSinceExpiry *
            (w1 * engagementLevel + w2 * discountSensitivity);

    // Map discount score to actual discount percentage and add bonus days
    double discountPercentage = mapScoreToDiscount(discountScore, timeSinceExpiry);
    int bonusDays = determineBonusDays(timeSinceExpiry, userSegment);

    // Log the calculation for analytics and debugging
    logDiscountCalculation(subscription, renewalProbability, engagementLevel,
            timeSinceExpiry, discountSensitivity, discountScore,
            discountPercentage, bonusDays, userSegment);

    return BigDecimal.valueOf(discountPercentage);
}

    // Calculate renewal probability (R) based on the formula: R = 0.3×N + 0.4×E + 0.3×D
    private double calculateRenewalProbability(SubscriptionService subscription) {
        double totalRenewalsNormalized = normalizeRenewals(subscription);
        double engagementLevel = calculateEngagementLevel(subscription);
        double discountSensitivity = calculateDiscountSensitivity(subscription);

        return 0.3 * totalRenewalsNormalized + 0.4 * engagementLevel + 0.3 * discountSensitivity;
    }

    // Normalize the total renewals to 0-1 range
    private double normalizeRenewals(SubscriptionService subscription) {
        // For simplicity, assume a max of 24 renewals (2 years for monthly subscription)
        // This value should be configurable based on business expectations
        int maxRenewals = 24;
        double averageSubscriptionLength = subscription.getAverageSubscriptionLength();
        int standardDuration = subscription.getStandardDurationDays();

        // Convert average subscription length to number of renewals
        double estimatedRenewals = standardDuration > 0 ?
                Math.max(0, averageSubscriptionLength / standardDuration - 1) : 0;

        return Math.min(1.0, estimatedRenewals / maxRenewals);
    }

    // Calculate engagement level (E) normalized to 0-1
    private double calculateEngagementLevel(SubscriptionService subscription) {
        // We don't have actual engagement metrics in the current model
        // Using active subscribers percentage as a proxy for engagement
        double activeRate = subscription.getTotalSubscribers() > 0 ?
                (double) subscription.getActiveSubscribers() / subscription.getTotalSubscribers() : 0;

        // Invert since lower active rate suggests lower engagement
        return Math.max(0, Math.min(1, activeRate));
    }

    // Calculate discount sensitivity (D) - this represents how likely users are to respond to discounts
    private double calculateDiscountSensitivity(SubscriptionService subscription) {
        // Using renewal rate as an inverse proxy for discount sensitivity
        // Lower renewal rates suggest higher sensitivity to discounts
        return Math.max(0, Math.min(1, 1 - subscription.getRenewalRate()));
    }

    // Calculate time since expiry (T) normalized to 0-1 based on grace period
    private double calculateTimeSinceExpiry(SubscriptionService subscription) {
        // We don't have individual subscription data with expiry dates
        // Using a proxy based on inactive subscribers percentage
        double inactiveRate = subscription.getTotalSubscribers() > 0 ?
                1 - ((double) subscription.getActiveSubscribers() / subscription.getTotalSubscribers()) : 0;

        // Scale to represent days passed in grace period (0-1)
        // 0 = just expired, 1 = at or beyond max grace period
        return Math.max(0, Math.min(1, inactiveRate));
    }

    // Map discount score to actual discount percentage
    private double mapScoreToDiscount(double discountScore, double timeSinceExpiry) {
        // Implement the tiered discount structure
        if (timeSinceExpiry < 0.15) { // 0-1 days for a 7-day grace period
            return 0.0; // No discount, just wait
        } else if (timeSinceExpiry < 0.3) { // 2 days for a 7-day grace period
            return discountScore < 0.4 ? 10.0 : 0.0;
        } else if (timeSinceExpiry < 0.7) { // 3-5 days for a 7-day grace period
            return discountScore < 0.6 ? 20.0 : 0.0;
        } else if (timeSinceExpiry < 1.0) { // 6-7 days for a 7-day grace period
            return discountScore < 0.8 ? 40.0 : 0.0;
        } else { // 8+ days (beyond grace period)
            return 50.0; // Flash discount
        }
    }

    // Determine number of bonus days to add
    private int determineBonusDays(double timeSinceExpiry, String userSegment) {
        if (timeSinceExpiry < 0.15) {
            return 0;
        } else if (timeSinceExpiry < 0.3) {
            return 2; // 2 bonus days
        } else if (timeSinceExpiry < 0.7) {
            return 3; // 3 bonus days
        } else if (timeSinceExpiry < 1.0) {
            return 5; // 5 bonus days
        } else {
            return 7; // 7 bonus days
        }
    }

    // Determine user segment based on behavior metrics
    private String determineUserSegment(double renewalProbability, double engagementLevel,
                                        double totalRenewalsNormalized, double discountSensitivity) {
        // Loyal Users: Regular renewals without offers
        if (renewalProbability > 0.8 && totalRenewalsNormalized > 0.5) {
            return "Loyal User";
        }
        // Discount Hunters: Renew only during discounts
        else if (discountSensitivity > 0.7) {
            return "Discount Hunter";
        }
        // High Engagement Users: Active but not renewing
        else if (engagementLevel > 0.7 && renewalProbability < 0.5) {
            return "High Engagement User";
        }
        // Inactive Users: Rarely used service
        else if (engagementLevel < 0.3) {
            return "Inactive User";
        }
        // New Users: Just 1 renewal
        else if (totalRenewalsNormalized < 0.1) {
            return "New User";
        }
        else {
            return "Standard User";
        }
    }

    // Log the calculation details for analytics and debugging
    private void logDiscountCalculation(SubscriptionService subscription, double renewalProbability,
                                        double engagementLevel, double timeSinceExpiry,
                                        double discountSensitivity, double discountScore,
                                        double discountPercentage, int bonusDays, String userSegment) {

        // Create log entity or just log to console for now
        System.out.println("==== Subscription Discount Calculation ====");
        System.out.println("Subscription ID: " + subscription.getSubscription_id());
        System.out.println("User Segment: " + userSegment);
        System.out.println("Renewal Probability (R): " + renewalProbability);
        System.out.println("Engagement Level (E): " + engagementLevel);
        System.out.println("Time Since Expiry (T): " + timeSinceExpiry);
        System.out.println("Discount Sensitivity (D): " + discountSensitivity);
        System.out.println("Discount Score: " + discountScore);
        System.out.println("Final Discount: " + discountPercentage + "%");
        System.out.println("Bonus Days: " + bonusDays);
        System.out.println("=========================================");

        // Here you could also save this to your discountCalculationLogRepository
    }

    private BigDecimal calculateSeasonalDiscount(Product product) {
        return BigDecimal.valueOf(3.5);
    }

    private BigDecimal getDiscountPercentage(BigDecimal discountScore) {
        if (discountScore.compareTo(BigDecimal.valueOf(0.5)) < 0) return BigDecimal.valueOf(5);
        else if (discountScore.compareTo(BigDecimal.valueOf(1.5)) < 0) return BigDecimal.valueOf(15);
        else if (discountScore.compareTo(BigDecimal.valueOf(2.5)) < 0) return BigDecimal.valueOf(30);
        else if (discountScore.compareTo(BigDecimal.valueOf(3.5)) < 0) return BigDecimal.valueOf(40);
        else return BigDecimal.valueOf(50);
    }
}