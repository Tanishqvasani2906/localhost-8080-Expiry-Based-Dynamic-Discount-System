package com.example.Expiry_Based_Dynamic_Discount_System.Service;

import com.example.Expiry_Based_Dynamic_Discount_System.Entity.*;
import com.example.Expiry_Based_Dynamic_Discount_System.Repository.DiscountCalculationLogRepository;
import com.example.Expiry_Based_Dynamic_Discount_System.Repository.DiscountHistoryRepository;
import com.example.Expiry_Based_Dynamic_Discount_System.Repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
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
    public BigDecimal calculateAndApplyDiscount(Product product) {
        BigDecimal discountScore = calculateDiscountScore(product);
        BigDecimal discountPercentage = getDiscountPercentage(discountScore);

        // Correcting discount calculation
        BigDecimal discountAmount = product.getBasePrice()
                .multiply(discountPercentage)
                .divide(BigDecimal.valueOf(100), 2, BigDecimal.ROUND_HALF_UP);

        BigDecimal discountedPrice = product.getBasePrice().subtract(discountAmount);

        // Store discount calculation log
        DiscountCalculationLog log = new DiscountCalculationLog();
        log.setProduct(product);
        log.setTotalDiscountScore(discountScore);
        log.setRecommendedDiscount(discountPercentage);
        log.setCalculatedAt(LocalDateTime.now());

        discountCalculationLogRepository.save(log);

        // Store discount history
        DiscountHistory discountHistory = new DiscountHistory();
        discountHistory.setProduct(product);
        discountHistory.setDiscountPercentage(discountPercentage);
        discountHistory.setOriginalPrice(product.getBasePrice());
        discountHistory.setDiscountedPrice(discountedPrice);
        discountHistory.setAppliedAt(LocalDateTime.now());
        discountHistory.setAppliedBy("System");

        discountHistoryRepository.save(discountHistory);

        return discountedPrice;
    }

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

    private BigDecimal calculateEventDiscount(Product product) {
        return BigDecimal.valueOf(3.0);
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