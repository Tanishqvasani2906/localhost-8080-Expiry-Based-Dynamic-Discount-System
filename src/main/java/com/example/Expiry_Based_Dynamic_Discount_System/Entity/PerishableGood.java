package com.example.Expiry_Based_Dynamic_Discount_System.Entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "perishable_goods")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PerishableGood {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String perishable_good_id;

    @OneToOne
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(nullable = false)
    private LocalDate manufacturingDate;

    @Column(nullable = false)
    private LocalDate expiryDate;

    @Column(nullable = false)
    private int maxShelfLife; // in days

    @Column(precision = 10, scale = 2)
    private BigDecimal currentDailySellingRate = BigDecimal.ZERO;

    @Column(precision = 10, scale = 2)
    private BigDecimal maxExpectedSellingRate;

    @Column(precision = 3, scale = 2)
    private BigDecimal qualityScore = BigDecimal.ONE;

    @Column(precision = 5, scale = 2)
    private BigDecimal currentDemandLevel = BigDecimal.ZERO;

    public BigDecimal getCurrentDailySellingRate() {
        return currentDailySellingRate;
    }

    public void setCurrentDailySellingRate(BigDecimal currentDailySellingRate) {
        this.currentDailySellingRate = currentDailySellingRate;
    }

    public BigDecimal getCurrentDemandLevel() {
        return currentDemandLevel;
    }

    public void setCurrentDemandLevel(BigDecimal currentDemandLevel) {
        this.currentDemandLevel = currentDemandLevel;
    }

    public LocalDate getExpiryDate() {
        return expiryDate;
    }

    public void setExpiryDate(LocalDate expiryDate) {
        this.expiryDate = expiryDate;
    }

    public LocalDate getManufacturingDate() {
        return manufacturingDate;
    }

    public void setManufacturingDate(LocalDate manufacturingDate) {
        this.manufacturingDate = manufacturingDate;
    }

    public BigDecimal getMaxExpectedSellingRate() {
        return maxExpectedSellingRate;
    }

    public void setMaxExpectedSellingRate(BigDecimal maxExpectedSellingRate) {
        this.maxExpectedSellingRate = maxExpectedSellingRate;
    }

    public int getMaxShelfLife() {
        return maxShelfLife;
    }

    public void setMaxShelfLife(int maxShelfLife) {
        this.maxShelfLife = maxShelfLife;
    }

    public String getPerishable_good_id() {
        return perishable_good_id;
    }

    public void setPerishable_good_id(String perishable_good_id) {
        this.perishable_good_id = perishable_good_id;
    }

    public Product getProduct() {
        return product;
    }

    public void setProduct(Product product) {
        this.product = product;
    }

    public BigDecimal getQualityScore() {
        return qualityScore;
    }

    public void setQualityScore(BigDecimal qualityScore) {
        this.qualityScore = qualityScore;
    }
}