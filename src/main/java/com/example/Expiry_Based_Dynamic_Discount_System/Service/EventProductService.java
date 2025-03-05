package com.example.Expiry_Based_Dynamic_Discount_System.Service;

import com.example.Expiry_Based_Dynamic_Discount_System.Entity.EventProduct;
import com.example.Expiry_Based_Dynamic_Discount_System.Entity.Product;
import com.example.Expiry_Based_Dynamic_Discount_System.Repository.EventProductRepository;
import com.example.Expiry_Based_Dynamic_Discount_System.Repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class EventProductService {

    @Autowired
    private EventProductRepository eventProductRepository;

    @Autowired
    private ProductRepository productRepository;

    // ✅ Add a new Event Product
    public EventProduct addEventProduct(String productId, EventProduct eventProduct) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        eventProduct.setProduct(product); // Ensure linkage to the Product
        eventProduct.setAvailableSeats(eventProduct.getTotalCapacity() - eventProduct.getSeatsBooked());
        return eventProductRepository.save(eventProduct);
    }

    // ✅ Get all Event Products
    public List<EventProduct> getAllEventProducts() {
        return eventProductRepository.findAll();
    }

    // ✅ Get an Event Product by Product ID
    public Optional<EventProduct> getEventProductByProductId(String productId) {
        return eventProductRepository.findByProductId(productId);
    }

    // ✅ Update an Event Product
    public EventProduct updateEventProduct(String productId, EventProduct updatedEventProduct) {
        EventProduct existingEventProduct = eventProductRepository.findByProductId(productId)
                .orElseThrow(() -> new RuntimeException("Event Product not found for the given Product"));

        existingEventProduct.setEventDate(updatedEventProduct.getEventDate());
        existingEventProduct.setEventVenue(updatedEventProduct.getEventVenue());
        existingEventProduct.setTotalCapacity(updatedEventProduct.getTotalCapacity());
        existingEventProduct.setSeatsBooked(updatedEventProduct.getSeatsBooked());
        existingEventProduct.setAvailableSeats(updatedEventProduct.getTotalCapacity() - updatedEventProduct.getSeatsBooked());
        existingEventProduct.setMinTicketPrice(updatedEventProduct.getMinTicketPrice());
        existingEventProduct.setMaxTicketPrice(updatedEventProduct.getMaxTicketPrice());

        return eventProductRepository.save(existingEventProduct);
    }

    // ✅ Delete an Event Product
    public void deleteEventProduct(String productId) {
        EventProduct eventProduct = eventProductRepository.findByProductId(productId)
                .orElseThrow(() -> new RuntimeException("Event Product not found for the given Product"));

        eventProductRepository.delete(eventProduct);
    }
}

