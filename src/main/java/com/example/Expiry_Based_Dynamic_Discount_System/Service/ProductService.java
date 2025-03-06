package com.example.Expiry_Based_Dynamic_Discount_System.Service;

import com.example.Expiry_Based_Dynamic_Discount_System.Entity.*;
import com.example.Expiry_Based_Dynamic_Discount_System.Repository.*;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;
    @Autowired
    private DiscountHistoryRepository discountHistoryRepository;
    @Autowired
    private PerishableGoodRepository perishableGoodRepository;
    @Autowired
    private EventProductRepository eventProductRepository;
    @Autowired
    private SubscriptionServiceRepository subscriptionServiceRepository;

    // Create a new product
    public Product addProduct(Product product) {
        if (product.getPerishableGood() != null) {
            product.getPerishableGood().setProduct(product);  // Explicitly set the product reference
        }
        return productRepository.save(product);
    }


    // Get all products
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    // Get a product by ID
    public Optional<Product> getProductById(String productId) {
        return productRepository.findById(productId);
    }

    // Update an existing product
//    public Product updateProduct(String productId, Product updatedProduct) {
//        return productRepository.findById(productId).map(existingProduct -> {
//            existingProduct.setName(updatedProduct.getName());
//            existingProduct.setDescription(updatedProduct.getDescription());
//            existingProduct.setProductCategory(updatedProduct.getProductCategory());
//            existingProduct.setBasePrice(updatedProduct.getBasePrice());
//            existingProduct.setTotalStock(updatedProduct.getTotalStock());
//            existingProduct.setCurrentStock(updatedProduct.getCurrentStock());
//            existingProduct.setMinStockThreshold(updatedProduct.getMinStockThreshold());
//            existingProduct.setMaxProfitMargin(updatedProduct.getMaxProfitMargin());
//            existingProduct.setCurrentProfitMargin(updatedProduct.getCurrentProfitMargin());
//            existingProduct.setUpdatedAt(updatedProduct.getUpdatedAt());
////            existingProduct.setImage_url(updatedProduct.getImage_url());
//
//            return productRepository.save(existingProduct);
//        }).orElseThrow(() -> new RuntimeException("Product not found with ID: " + productId));
//    }
    @Transactional
    public Product updateProduct(String productId, Product updatedProduct) {
        return productRepository.findById(productId).map(existingProduct -> {
            // Common fields update
            existingProduct.setName(updatedProduct.getName());
            existingProduct.setDescription(updatedProduct.getDescription());
            existingProduct.setProductCategory(updatedProduct.getProductCategory());
            existingProduct.setBasePrice(updatedProduct.getBasePrice());
            existingProduct.setTotalStock(updatedProduct.getTotalStock());
            existingProduct.setCurrentStock(updatedProduct.getCurrentStock());
            existingProduct.setMinStockThreshold(updatedProduct.getMinStockThreshold());
            existingProduct.setMaxProfitMargin(updatedProduct.getMaxProfitMargin());
            existingProduct.setCurrentProfitMargin(updatedProduct.getCurrentProfitMargin());
            existingProduct.setUpdatedAt(updatedProduct.getUpdatedAt());

            // Handle PERISHABLE category
            if (existingProduct.getProductCategory() == ProductCategory.PERISHABLE) {
                Optional<PerishableGood> perishableOpt = perishableGoodRepository.findByProductId(productId);
                if (perishableOpt.isPresent() && updatedProduct.getPerishableGood() != null) {
                    PerishableGood perishable = perishableOpt.get();
                    perishable.setExpiryDate(updatedProduct.getPerishableGood().getExpiryDate());
                    perishable.setManufacturingDate(updatedProduct.getPerishableGood().getManufacturingDate());
                    perishableGoodRepository.save(perishable);
                }
            }

            // Handle EVENT category
            else if (existingProduct.getProductCategory() == ProductCategory.EVENT) {
                Optional<EventProduct> eventOpt = eventProductRepository.findByProductId(productId);
                if (eventOpt.isPresent() && updatedProduct.getEventProduct() != null) {
                    EventProduct eventProduct = eventOpt.get();
//                    eventProduct.setEventDetails(updatedProduct.getEventProduct().getEventDetails());
                    eventProduct.setEventDate(updatedProduct.getEventProduct().getEventDate());
                    eventProductRepository.save(eventProduct);
                }
            }

            // Handle SUBSCRIPTION category
            else if (existingProduct.getProductCategory() == ProductCategory.SUBSCRIPTION) {
                SubscriptionService subscription = existingProduct.getSubscriptionService();
                if (subscription != null && updatedProduct.getSubscriptionService() != null) {
                    subscription.setRenewalRate(updatedProduct.getSubscriptionService().getRenewalRate());
                    subscription.setTotalSubscribers(updatedProduct.getSubscriptionService().getTotalSubscribers());
                    subscription.setActiveSubscribers(updatedProduct.getSubscriptionService().getActiveSubscribers());
                    subscriptionServiceRepository.save(subscription);
                }
            }

            return productRepository.save(existingProduct);
        }).orElseThrow(() -> new RuntimeException("Product not found with ID: " + productId));
    }


    // Delete a product
    @Transactional
    public void deleteProduct(String productId) {
        // Fetch the Product
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found with ID: " + productId));

        // Delete associated entities based on Product Category
        switch (product.getProductCategory()) {
            case PERISHABLE:
                perishableGoodRepository.deleteByProductId(productId);
                break;

            case EVENT:
                eventProductRepository.deleteByProductId(productId);
                break;

            case SUBSCRIPTION:
                subscriptionServiceRepository.deleteByProductId(productId);
                break;

            // Add other product categories here if needed
            default:
                throw new RuntimeException("Unsupported product category: " + product.getProductCategory());
        }

        // Finally, delete the Product
        productRepository.deleteById(productId);
    }



    public Optional<DiscountHistory> getLatestDiscount(String productId) {
        List<DiscountHistory> discountList = discountHistoryRepository.findLatestDiscountByProductId(productId);
        return discountList.isEmpty() ? Optional.empty() : Optional.of(discountList.get(0));
    }

}
