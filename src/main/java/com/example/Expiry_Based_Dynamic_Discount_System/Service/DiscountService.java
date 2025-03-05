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
        BigDecimal discountScore = calculateDiscountScore(product);
        BigDecimal discountPercentage = getDiscountPercentage(discountScore);

        BigDecimal discountAmount = product.getBasePrice()
                .multiply(discountPercentage)
                .divide(BigDecimal.valueOf(100), 2, BigDecimal.ROUND_HALF_UP);

        BigDecimal discountedPrice = product.getBasePrice().subtract(discountAmount);

        // 🔹 Fetch last discount history entry to avoid redundant writes
        DiscountHistory lastHistory = discountHistoryRepository.findLatestDiscountByProduct(String.valueOf(product));

        if (lastHistory == null || lastHistory.getDiscountPercentage().compareTo(discountPercentage) != 0) {
            DiscountHistory discountHistory = new DiscountHistory();
            discountHistory.setProduct(product);
            discountHistory.setDiscountPercentage(discountPercentage);
            discountHistory.setOriginalPrice(product.getBasePrice());
            discountHistory.setDiscountedPrice(discountedPrice);
            discountHistory.setAppliedAt(LocalDateTime.now());
            discountHistory.setAppliedBy("System");

            discountHistoryRepository.save(discountHistory);
        }

        return discountedPrice;
    }


    // 🔹 Determines discount score based on product type
    private BigDecimal calculateDiscountScore(Product product) {
        switch (product.getProductCategory()) {
            case PERISHABLE:
                return calculatePerishableDiscount(product);
            case EVENT:
                return calculateEventDiscount(product.getEventProduct(), product);
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

        // ✅ Expiry Time Score
        long daysToExpiry = java.time.temporal.ChronoUnit.DAYS.between(
                LocalDate.now(), perishableGood.getExpiryDate()
        );
        BigDecimal expiryTimeScore = BigDecimal.ONE.subtract(
                new BigDecimal(daysToExpiry)
                        .divide(new BigDecimal(perishableGood.getMaxShelfLife()), 2, BigDecimal.ROUND_HALF_UP)
        );

        // ✅ Demand Trend Score
        BigDecimal demandTrendScore = BigDecimal.ONE.subtract(
                new BigDecimal(String.valueOf(perishableGood.getCurrentDemandLevel()))
                        .divide(new BigDecimal("100"), 2, BigDecimal.ROUND_HALF_UP)
        );

        // ✅ Stock Clearance Factor (SCF)
        BigDecimal scf = BigDecimal.ZERO;
        if (daysToExpiry > 0 && perishableGood.getCurrentDailySellingRate().compareTo(BigDecimal.ZERO) > 0) {
            scf = new BigDecimal(product.getCurrentStock()).divide(
                    new BigDecimal(daysToExpiry).multiply(new BigDecimal(String.valueOf(perishableGood.getCurrentDailySellingRate()))),
                    2, BigDecimal.ROUND_HALF_UP
            );
        }
        BigDecimal scfNormalized = scf.divide(new BigDecimal("5"), 2, BigDecimal.ROUND_HALF_UP);

        // 🎯 Final Discount Score Calculation (Adjusted Weights)
        BigDecimal discountScore = expiryTimeScore.multiply(new BigDecimal("0.4"))
                .add(demandTrendScore.multiply(new BigDecimal("0.3")))
                .add(scfNormalized.multiply(new BigDecimal("0.3")));

        return discountScore;
    }

    private BigDecimal calculateEventDiscount(EventProduct event, Product product) {
        // 1. Calculate Parameters
        long daysLeft = ChronoUnit.DAYS.between(LocalDate.now(), event.getEventDate().toLocalDate());
        long maxDays = 30; // Assume max 30 days as booking period

        double T = 1 - ((double) daysLeft / maxDays);
        double B = (double) event.getSeatsBooked() / event.getTotalCapacity();
        double S = 1 - ((double) event.getAvailableSeats() / event.getTotalCapacity());
        double D = 0.7; // Assume demand factor from external analytics

        // ✅ FIX: BigDecimal Division
        BigDecimal profitMarginRatio = BigDecimal.ONE;
        if (product.getMaxProfitMargin().compareTo(BigDecimal.ZERO) > 0) {
            profitMarginRatio = BigDecimal.ONE.subtract(
                    product.getCurrentProfitMargin().divide(product.getMaxProfitMargin(), 2, RoundingMode.HALF_UP)
            );
        }
        double P = profitMarginRatio.doubleValue();  // Convert to double for calculations

        // 2. Apply Weighted Formula
        double discountScore = (0.35 * T) + (0.25 * B) + (0.15 * S) + (0.15 * D) + (0.10 * P);

        // 3. Determine Price Adjustment
        double priceMultiplier;
        if (discountScore >= 4.0 || event.getAvailableSeats() <= 5) {
            priceMultiplier = 1.30; // 30% Surge Pricing
        } else if (discountScore >= 3.0) {
            priceMultiplier = 1.20; // 20% Surge Pricing
        } else if (discountScore >= 2.0) {
            priceMultiplier = 1.10; // 10% Surge Pricing
        } else if (discountScore >= 1.0) {
            priceMultiplier = 1.00; // No discount
        } else {
            priceMultiplier = 0.90; // 10% Discount
        }

        // ✅ FIX: Edge Cases
        if (daysLeft < 1 && event.getAvailableSeats() > 10) {
            priceMultiplier = 0.50; // Last 2 hours, 50% Discount
        } else if (daysLeft > 10 && event.getSeatsBooked() < (event.getTotalCapacity() * 0.2)) {
            priceMultiplier = 0.60; // Low demand, flash discount
        }

        // 4. Calculate Final Price
        BigDecimal basePrice = event.getMinTicketPrice();
        BigDecimal finalPrice = basePrice.multiply(BigDecimal.valueOf(priceMultiplier));

        return finalPrice.min(event.getMaxTicketPrice()); // Ensure max limit
    }



    private BigDecimal calculateSubscriptionDiscount(Product product) {
        return BigDecimal.valueOf(1.5);
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