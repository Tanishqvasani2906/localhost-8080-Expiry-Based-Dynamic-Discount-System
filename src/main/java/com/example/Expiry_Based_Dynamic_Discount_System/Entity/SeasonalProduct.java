package com.example.Expiry_Based_Dynamic_Discount_System.Entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "seasonal_products")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SeasonalProduct {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String seasonal_product_id;

    @OneToOne
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(nullable = false)
    private LocalDate seasonStartDate;

    @Column(nullable = false)
    private LocalDate seasonEndDate;

    private LocalDate peakDemandPeriod;

    private LocalDate offPeakDemandPeriod;

    @Column(precision = 10, scale = 2)
    private BigDecimal peakSeasonPrice;

    @Column(precision = 10, scale = 2)
    private BigDecimal offSeasonPrice;

    public LocalDate getOffPeakDemandPeriod() {
        return offPeakDemandPeriod;
    }

    public void setOffPeakDemandPeriod(LocalDate offPeakDemandPeriod) {
        this.offPeakDemandPeriod = offPeakDemandPeriod;
    }

    public BigDecimal getOffSeasonPrice() {
        return offSeasonPrice;
    }

    public void setOffSeasonPrice(BigDecimal offSeasonPrice) {
        this.offSeasonPrice = offSeasonPrice;
    }

    public LocalDate getPeakDemandPeriod() {
        return peakDemandPeriod;
    }

    public void setPeakDemandPeriod(LocalDate peakDemandPeriod) {
        this.peakDemandPeriod = peakDemandPeriod;
    }

    public BigDecimal getPeakSeasonPrice() {
        return peakSeasonPrice;
    }

    public void setPeakSeasonPrice(BigDecimal peakSeasonPrice) {
        this.peakSeasonPrice = peakSeasonPrice;
    }

    public Product getProduct() {
        return product;
    }

    public void setProduct(Product product) {
        this.product = product;
    }

    public String getSeasonal_product_id() {
        return seasonal_product_id;
    }

    public void setSeasonal_product_id(String seasonal_product_id) {
        this.seasonal_product_id = seasonal_product_id;
    }

    public LocalDate getSeasonEndDate() {
        return seasonEndDate;
    }

    public void setSeasonEndDate(LocalDate seasonEndDate) {
        this.seasonEndDate = seasonEndDate;
    }

    public LocalDate getSeasonStartDate() {
        return seasonStartDate;
    }

    public void setSeasonStartDate(LocalDate seasonStartDate) {
        this.seasonStartDate = seasonStartDate;
    }
}