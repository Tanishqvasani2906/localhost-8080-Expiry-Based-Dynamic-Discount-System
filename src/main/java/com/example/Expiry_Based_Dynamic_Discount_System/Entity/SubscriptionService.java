package com.example.Expiry_Based_Dynamic_Discount_System.Entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "subscription_services")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SubscriptionService {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String subscription_id;

    @OneToOne
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(nullable = false)
    private int standardDurationDays;

    @Column(nullable = false)
    private int gracePeriodDays = 7;

    private int totalSubscribers = 0;

    private int activeSubscribers = 0;

    private double renewalRate = 0.0;

    private int averageSubscriptionLength = 0;


    public int getActiveSubscribers() {
        return activeSubscribers;
    }

    public void setActiveSubscribers(int activeSubscribers) {
        this.activeSubscribers = activeSubscribers;
    }

    public int getAverageSubscriptionLength() {
        return averageSubscriptionLength;
    }

    public void setAverageSubscriptionLength(int averageSubscriptionLength) {
        this.averageSubscriptionLength = averageSubscriptionLength;
    }

    public int getGracePeriodDays() {
        return gracePeriodDays;
    }

    public void setGracePeriodDays(int gracePeriodDays) {
        this.gracePeriodDays = gracePeriodDays;
    }

    public Product getProduct() {
        return product;
    }

    public void setProduct(Product product) {
        this.product = product;
    }

    public double getRenewalRate() {
        return renewalRate;
    }

    public void setRenewalRate(double renewalRate) {
        this.renewalRate = renewalRate;
    }

    public int getStandardDurationDays() {
        return standardDurationDays;
    }

    public void setStandardDurationDays(int standardDurationDays) {
        this.standardDurationDays = standardDurationDays;
    }

    public String getSubscription_id() {
        return subscription_id;
    }

    public void setSubscription_id(String subscription_id) {
        this.subscription_id = subscription_id;
    }

    public int getTotalSubscribers() {
        return totalSubscribers;
    }

    public void setTotalSubscribers(int totalSubscribers) {
        this.totalSubscribers = totalSubscribers;
    }
}