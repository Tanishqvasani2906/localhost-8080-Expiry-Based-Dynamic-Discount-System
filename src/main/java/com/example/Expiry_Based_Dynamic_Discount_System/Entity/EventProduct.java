package com.example.Expiry_Based_Dynamic_Discount_System.Entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "event_products")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class EventProduct {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String event_product_id;

    @OneToOne
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(nullable = false)
    private LocalDateTime eventDate;

    private String eventVenue;

    @Column(nullable = false)
    private int totalCapacity;

    @Column(nullable = false)
    private int seatsBooked = 0;

    @Column(nullable = false)
    private int availableSeats;

    @Column(precision = 10, scale = 2)
    private BigDecimal minTicketPrice;

    @Column(precision = 10, scale = 2)
    private BigDecimal maxTicketPrice;

    public int getAvailableSeats() {
        return availableSeats;
    }

    public void setAvailableSeats(int availableSeats) {
        this.availableSeats = availableSeats;
    }

    public String getEvent_product_id() {
        return event_product_id;
    }

    public void setEvent_product_id(String event_product_id) {
        this.event_product_id = event_product_id;
    }

    public LocalDateTime getEventDate() {
        return eventDate;
    }

    public void setEventDate(LocalDateTime eventDate) {
        this.eventDate = eventDate;
    }

    public String getEventVenue() {
        return eventVenue;
    }

    public void setEventVenue(String eventVenue) {
        this.eventVenue = eventVenue;
    }

    public BigDecimal getMaxTicketPrice() {
        return maxTicketPrice;
    }

    public void setMaxTicketPrice(BigDecimal maxTicketPrice) {
        this.maxTicketPrice = maxTicketPrice;
    }

    public BigDecimal getMinTicketPrice() {
        return minTicketPrice;
    }

    public void setMinTicketPrice(BigDecimal minTicketPrice) {
        this.minTicketPrice = minTicketPrice;
    }

    public Product getProduct() {
        return product;
    }

    public void setProduct(Product product) {
        this.product = product;
    }

    public int getSeatsBooked() {
        return seatsBooked;
    }

    public void setSeatsBooked(int seatsBooked) {
        this.seatsBooked = seatsBooked;
    }

    public int getTotalCapacity() {
        return totalCapacity;
    }

    public void setTotalCapacity(int totalCapacity) {
        this.totalCapacity = totalCapacity;
    }
}