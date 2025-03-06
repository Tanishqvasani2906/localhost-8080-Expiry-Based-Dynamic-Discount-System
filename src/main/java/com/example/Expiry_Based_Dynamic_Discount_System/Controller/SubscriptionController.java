package com.example.Expiry_Based_Dynamic_Discount_System.Controller;

import com.example.Expiry_Based_Dynamic_Discount_System.Entity.Product;
import com.example.Expiry_Based_Dynamic_Discount_System.Entity.SubscriptionService;
import com.example.Expiry_Based_Dynamic_Discount_System.Service.ProductService;
import com.example.Expiry_Based_Dynamic_Discount_System.Service.SubscriptionServiceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/subscriptions")
public class SubscriptionController {

    @Autowired
    private SubscriptionServiceService subscriptionService;
    @Autowired
    private ProductService productService;

    @GetMapping("/getAllSubscriptions")
    public ResponseEntity<List<SubscriptionService>> getAllSubscriptions() {
        return ResponseEntity.ok(subscriptionService.getAllSubscriptions());
    }

    @GetMapping("/getSubscriptionById/{id}")
    public ResponseEntity<SubscriptionService> getSubscriptionById(@PathVariable String id) {
        Optional<SubscriptionService> subscription = subscriptionService.getSubscriptionById(id);
        return subscription.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<SubscriptionService> getSubscriptionByProductId(@PathVariable String productId) {
        Optional<SubscriptionService> subscription = subscriptionService.getSubscriptionByProductId(productId);
        return subscription.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping("/subscriptionProducts/add/{productId}")
    public ResponseEntity<?> createSubscription(@PathVariable String productId, @RequestBody SubscriptionService subscription) {
        // 🔹 Fetch the product from the database
        Optional<Product> productOptional = productService.getProductById(productId);
        if (productOptional.isEmpty()) {
            return ResponseEntity.badRequest().body("Product with ID " + productId + " not found.");
        }

        // 🔹 Set the product in the subscription entity
        subscription.setProduct(productOptional.get());

        // 🔹 Save the subscription
        SubscriptionService savedSubscription = subscriptionService.saveSubscription(subscription);

        return ResponseEntity.ok(savedSubscription);
    }
    @DeleteMapping("/deleteSubscriptionById/{id}")
    public ResponseEntity<Void> deleteSubscription(@PathVariable String id) {
        subscriptionService.deleteSubscription(id);
        return ResponseEntity.noContent().build();
    }
}
