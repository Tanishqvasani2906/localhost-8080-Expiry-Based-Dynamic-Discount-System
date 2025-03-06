package com.example.Expiry_Based_Dynamic_Discount_System.Controller;

import com.example.Expiry_Based_Dynamic_Discount_System.Entity.*;
import com.example.Expiry_Based_Dynamic_Discount_System.Repository.EventProductRepository;
import com.example.Expiry_Based_Dynamic_Discount_System.Repository.PerishableGoodRepository;
import com.example.Expiry_Based_Dynamic_Discount_System.Repository.SubscriptionServiceRepository;
import com.example.Expiry_Based_Dynamic_Discount_System.Service.DiscountService;
import com.example.Expiry_Based_Dynamic_Discount_System.Service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/products")
public class ProductController {

    @Autowired
    private ProductService productService;
    @Autowired
    private DiscountService discountService;
    @Autowired
    private PerishableGoodRepository perishableGoodRepository;
    @Autowired
    private SubscriptionServiceRepository subscriptionServiceRepository;
    @Autowired
    private EventProductRepository eventProductRepository;

    // Create a new product (Only Admin)
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/addProduct")
    public ResponseEntity<Product> createProduct(@RequestBody Product product) {
        Product savedProduct = productService.addProduct(product);
        return ResponseEntity.ok(savedProduct);
    }

    // Get all products (Accessible to all)
//    @GetMapping("/getAllProducts")
//    public ResponseEntity<List<Product>> getAllProducts() {
//        List<Product> products = productService.getAllProducts();
//        return ResponseEntity.ok(products);
//    }

    @GetMapping("/getAllProducts")
    public ResponseEntity<List<Map<String, Object>>> getAllProducts() {
        // Fetch all products
        List<Product> allProducts = productService.getAllProducts();

        // Merge product and discount details into the response
        List<Map<String, Object>> mergedResults = allProducts.stream().map(product -> {
            BigDecimal discountedPrice = discountService.calculateAndApplyDiscount(product);

            // Prepare the response map
            Map<String, Object> response = new HashMap<>();
            response.put("productId", product.getProduct_id());
            response.put("productName", product.getName());
            response.put("description", product.getDescription());
            response.put("productCategory", product.getProductCategory().toString());
            response.put("basePrice", product.getBasePrice());
            response.put("currentStock", product.getCurrentStock());
            response.put("totalStock", product.getTotalStock());
            response.put("minStockThreshold", product.getMinStockThreshold());
            response.put("image_url", product.getImage_url());
            response.put("createdAt", product.getCreatedAt());
            response.put("updatedAt", product.getUpdatedAt());
            response.put("maximumProfitMargin", product.getMaxProfitMargin());

            // Adding Discount Details
            response.put("discountedPrice", discountedPrice);
            response.put("discountPercentage", product.getCurrentProfitMargin());

            // Check if the product is of category PERISHABLE and add perishable specific fields
            if (product.getProductCategory() == ProductCategory.PERISHABLE) {
                // Fetch the PerishableGood details (Optional)
                Optional<PerishableGood> perishableGoodOptional = perishableGoodRepository.findByProductId(product.getProduct_id());

                // Check if the PerishableGood exists
                perishableGoodOptional.ifPresent(perishableGood -> {
                    // Add expiryDate and manufacturingDate to the response
                    response.put("expiryDate", perishableGood.getExpiryDate().toString());  // Convert to string if necessary
                    response.put("manufacturingDate", perishableGood.getManufacturingDate().toString());  // Convert to string if necessary
                });
            }
            if (product.getProductCategory() == ProductCategory.SUBSCRIPTION) {
                // Fetch the SubscriptionService details (Optional)
                Optional<SubscriptionService> subscriptionServiceOptional = subscriptionServiceRepository.findByProductId(product.getProduct_id());

                // Check if the SubscriptionService exists
                subscriptionServiceOptional.ifPresent(subscriptionService -> {
                    // Add renewalRate, totalSubscribers, activeSubscribers to the response
                    response.put("renewalRate", subscriptionService.getRenewalRate());
                    response.put("totalSubscribers", subscriptionService.getTotalSubscribers());
                    response.put("activeSubscribers", subscriptionService.getActiveSubscribers());
                });
            }

            // Check if the product is of category EVENT and add event specific fields
            if (product.getProductCategory() == ProductCategory.EVENT) {
                // Fetch the EventProduct details (Optional)
                Optional<EventProduct> eventProductOptional = eventProductRepository.findByProductId(product.getProduct_id());

                // Check if the EventProduct exists
                eventProductOptional.ifPresent(eventProduct -> {
                    // Add eventDate and eventDetails to the response
                    response.put("eventDate", eventProduct.getEventDate().toString());
                });
            }

            return response;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(mergedResults);
    }


    @GetMapping("/getByProductId/{productId}")
    public ResponseEntity<Map<String, Object>> getProductById(@PathVariable String productId) {
        Optional<Product> productOptional = productService.getProductById(productId);

        if (productOptional.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Product product = productOptional.get();
        Optional<DiscountHistory> latestDiscount = productService.getLatestDiscount(product.getProduct_id());

        Map<String, Object> response = new HashMap<>();
        response.put("product_id", product.getProduct_id());
        response.put("name", product.getName());
        response.put("description", product.getDescription());
        response.put("basePrice", product.getBasePrice());
        response.put("discountedPrice", latestDiscount.map(DiscountHistory::getDiscountedPrice).orElse(product.getBasePrice()));
        response.put("image_url", product.getImage_url());

        return ResponseEntity.ok(response);
    }

    // Update a product (Only Admin)
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/updateByProductId/{productId}")
    public ResponseEntity<?> updateProduct(@PathVariable String productId, @RequestBody Product updatedProduct) {
        try {
            if (updatedProduct.getProductCategory() == null) {
                return ResponseEntity.badRequest().body("Product category is required!");
            }

            Product updated = productService.updateProduct(productId, updatedProduct);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Error: " + e.getMessage());
        }
    }


    // Delete a product (Only Admin)
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/deleteProductByProductId/{productId}")
    public ResponseEntity<Void> deleteProduct(@PathVariable String productId) {
        productService.deleteProduct(productId);
        return ResponseEntity.noContent().build();
    }
}
