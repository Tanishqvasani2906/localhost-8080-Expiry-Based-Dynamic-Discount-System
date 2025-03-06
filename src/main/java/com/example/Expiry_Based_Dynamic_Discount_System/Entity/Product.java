package com.example.Expiry_Based_Dynamic_Discount_System.Entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "products")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String product_id;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProductCategory productCategory;

    @Column(nullable = true, precision = 10, scale = 2)
    private BigDecimal basePrice;

    @Column(nullable = true)
    private int totalStock;

    @Column(nullable = true)
    private int currentStock;

    @Column(nullable = false)
    private String image_url;

    private Integer minStockThreshold;

    @Column(precision = 5, scale = 2)
    private BigDecimal maxProfitMargin;

    @Column(precision = 5, scale = 2)
    private BigDecimal currentProfitMargin;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    // Relationships with subtype tables
    @OneToOne(mappedBy = "product", cascade = CascadeType.ALL)

    private PerishableGood perishableGood;

    @OneToOne(mappedBy = "product")
    private EventProduct eventProduct;

    @OneToOne(mappedBy = "product", cascade = CascadeType.ALL)
    private SubscriptionService subscriptionService;

    @OneToOne(mappedBy = "product", cascade = CascadeType.ALL)
    private SeasonalProduct seasonalProduct;

    public BigDecimal getBasePrice() {
        return basePrice;
    }

    public void setBasePrice(BigDecimal basePrice) {
        this.basePrice = basePrice;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public BigDecimal getCurrentProfitMargin() {
        return currentProfitMargin;
    }

    public void setCurrentProfitMargin(BigDecimal currentProfitMargin) {
        this.currentProfitMargin = currentProfitMargin;
    }

    public int getCurrentStock() {
        return currentStock;
    }

    public void setCurrentStock(int currentStock) {
        this.currentStock = currentStock;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public EventProduct getEventProduct() {
        return eventProduct;
    }

    public void setEventProduct(EventProduct eventProduct) {
        this.eventProduct = eventProduct;
    }

    public BigDecimal getMaxProfitMargin() {
        return maxProfitMargin;
    }

    public void setMaxProfitMargin(BigDecimal maxProfitMargin) {
        this.maxProfitMargin = maxProfitMargin;
    }

    public Integer getMinStockThreshold() {
        return minStockThreshold;
    }

    public void setMinStockThreshold(Integer minStockThreshold) {
        this.minStockThreshold = minStockThreshold;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public PerishableGood getPerishableGood() {
        return perishableGood;
    }

    public void setPerishableGood(PerishableGood perishableGood) {
        this.perishableGood = perishableGood;
    }

    public String getProduct_id() {
        return product_id;
    }

    public void setProduct_id(String product_id) {
        this.product_id = product_id;
    }

    public ProductCategory getProductCategory() {
        return productCategory;
    }

    public void setProductCategory(ProductCategory productCategory) {
        this.productCategory = productCategory;
    }

    public SeasonalProduct getSeasonalProduct() {
        return seasonalProduct;
    }

    public void setSeasonalProduct(SeasonalProduct seasonalProduct) {
        this.seasonalProduct = seasonalProduct;
    }

    public SubscriptionService getSubscriptionService() {
        return subscriptionService;
    }

    public void setSubscriptionService(SubscriptionService subscriptionService) {
        this.subscriptionService = subscriptionService;
    }

    public int getTotalStock() {
        return totalStock;
    }

    public void setTotalStock(int totalStock) {
        this.totalStock = totalStock;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public String getImage_url() {
        return image_url;
    }

    public void setImage_url(String image_url) {
        this.image_url = image_url;
    }
}

