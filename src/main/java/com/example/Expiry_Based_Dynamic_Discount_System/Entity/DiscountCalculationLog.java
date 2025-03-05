package com.example.Expiry_Based_Dynamic_Discount_System.Entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "discount_calculation_log")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DiscountCalculationLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String discount_calculation_id;

    @ManyToOne
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    private BigDecimal stockLevelScore;
    private BigDecimal expiryTimeScore;
    private BigDecimal sellingRateScore;
    private BigDecimal profitMarginScore;
    private BigDecimal demandTrendScore;

    private BigDecimal totalDiscountScore;
    private BigDecimal recommendedDiscount;

    @Column(nullable = false)
    private LocalDateTime calculatedAt = LocalDateTime.now();

    public LocalDateTime getCalculatedAt() {
        return calculatedAt;
    }

    public void setCalculatedAt(LocalDateTime calculatedAt) {
        this.calculatedAt = calculatedAt;
    }

    public BigDecimal getDemandTrendScore() {
        return demandTrendScore;
    }

    public void setDemandTrendScore(BigDecimal demandTrendScore) {
        this.demandTrendScore = demandTrendScore;
    }

    public String getDiscount_calculation_id() {
        return discount_calculation_id;
    }

    public void setDiscount_calculation_id(String discount_calculation_id) {
        this.discount_calculation_id = discount_calculation_id;
    }

    public BigDecimal getExpiryTimeScore() {
        return expiryTimeScore;
    }

    public void setExpiryTimeScore(BigDecimal expiryTimeScore) {
        this.expiryTimeScore = expiryTimeScore;
    }

    public Product getProduct() {
        return product;
    }

    public void setProduct(Product product) {
        this.product = product;
    }

    public BigDecimal getProfitMarginScore() {
        return profitMarginScore;
    }

    public void setProfitMarginScore(BigDecimal profitMarginScore) {
        this.profitMarginScore = profitMarginScore;
    }

    public BigDecimal getRecommendedDiscount() {
        return recommendedDiscount;
    }

    public void setRecommendedDiscount(BigDecimal recommendedDiscount) {
        this.recommendedDiscount = recommendedDiscount;
    }

    public BigDecimal getSellingRateScore() {
        return sellingRateScore;
    }

    public void setSellingRateScore(BigDecimal sellingRateScore) {
        this.sellingRateScore = sellingRateScore;
    }

    public BigDecimal getStockLevelScore() {
        return stockLevelScore;
    }

    public void setStockLevelScore(BigDecimal stockLevelScore) {
        this.stockLevelScore = stockLevelScore;
    }

    public BigDecimal getTotalDiscountScore() {
        return totalDiscountScore;
    }

    public void setTotalDiscountScore(BigDecimal totalDiscountScore) {
        this.totalDiscountScore = totalDiscountScore;
    }
}