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





    private BigDecimal calculateSubscriptionDiscount(Product product) {
        if (product == null || product.getProductCategory() == null || product.getProductCategory() != ProductCategory.SUBSCRIPTION) {
            return BigDecimal.ZERO; // No discount for non-subscription products
        }

        SubscriptionService subscription = product.getSubscriptionService();
        if (subscription == null) {
            return BigDecimal.ZERO; // No discount if no subscription details available
        }

        double discount = 0.0;

        // Base discount based on renewal rate
        if (subscription.getRenewalRate() > 0.7) {
            discount += 5.0;
        } else if (subscription.getRenewalRate() > 0.5) {
            discount += 10.0;
        } else {
            discount += 15.0;
        }

        // Additional discount if many subscribers have expired
        int daysSinceExpiry = subscription.getStandardDurationDays() + subscription.getGracePeriodDays() - subscription.getActiveSubscribers();
        if (daysSinceExpiry > subscription.getGracePeriodDays()) {
            discount += 10.0;
        }

        // Encourage renewals for services with fewer active subscribers
        if (subscription.getActiveSubscribers() < (subscription.getTotalSubscribers() * 0.3)) {
            discount += 10.0;
        }

        // Ensuring discount doesn't exceed 50%
        return BigDecimal.valueOf(Math.min(discount, 50.0));
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