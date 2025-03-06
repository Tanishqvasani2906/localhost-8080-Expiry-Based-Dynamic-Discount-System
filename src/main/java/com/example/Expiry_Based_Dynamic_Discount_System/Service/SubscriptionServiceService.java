package com.example.Expiry_Based_Dynamic_Discount_System.Service;

import com.example.Expiry_Based_Dynamic_Discount_System.Entity.SubscriptionService;

import com.example.Expiry_Based_Dynamic_Discount_System.Repository.SubscriptionServiceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class SubscriptionServiceService {

    @Autowired
    private SubscriptionServiceRepository subscriptionRepository;

    public List<SubscriptionService> getAllSubscriptions() {
        return subscriptionRepository.findAll();
    }

    public Optional<SubscriptionService> getSubscriptionById(String id) {
        return subscriptionRepository.findById(id);
    }

    public Optional<SubscriptionService> getSubscriptionByProductId(String productId) {
        return subscriptionRepository.findByProductId(productId);
    }

    public SubscriptionService saveSubscription(SubscriptionService subscriptionService) {
        return subscriptionRepository.save(subscriptionService);
    }

    public void deleteSubscription(String id) {
        subscriptionRepository.deleteById(id);
    }
}
