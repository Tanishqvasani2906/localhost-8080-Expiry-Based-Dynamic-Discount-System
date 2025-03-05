package com.example.Expiry_Based_Dynamic_Discount_System.Service;

import com.example.Expiry_Based_Dynamic_Discount_System.Entity.PerishableGood;
import com.example.Expiry_Based_Dynamic_Discount_System.Entity.Product;
import com.example.Expiry_Based_Dynamic_Discount_System.Repository.PerishableGoodRepository;
import com.example.Expiry_Based_Dynamic_Discount_System.Repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PerishableGoodService {

    @Autowired
    private PerishableGoodRepository perishableGoodRepository;

    @Autowired
    private ProductRepository productRepository;

    // Add a perishable good linked to a product
    public PerishableGood addPerishableGood(String productId, PerishableGood perishableGood) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        perishableGood.setProduct(product); // Explicitly set the product reference
        return perishableGoodRepository.save(perishableGood);
    }

    // Get all perishable goods
    public List<PerishableGood> getAllPerishableGoods() {
        return perishableGoodRepository.findAll();
    }

    // Get perishable good by Product ID
    public Optional<PerishableGood> getPerishableGoodByProductId(String productId) {
        return perishableGoodRepository.findByProductId(productId);
    }

    // Update perishable good details
    public PerishableGood updatePerishableGood(String productId, PerishableGood updatedPerishableGood) {
        PerishableGood existingPerishableGood = perishableGoodRepository.findByProductId(productId)
                .orElseThrow(() -> new RuntimeException("Perishable Good not found for the given Product"));

        existingPerishableGood.setManufacturingDate(updatedPerishableGood.getManufacturingDate());
        existingPerishableGood.setExpiryDate(updatedPerishableGood.getExpiryDate());
        existingPerishableGood.setMaxShelfLife(updatedPerishableGood.getMaxShelfLife());
        existingPerishableGood.setCurrentDailySellingRate(updatedPerishableGood.getCurrentDailySellingRate());
        existingPerishableGood.setMaxExpectedSellingRate(updatedPerishableGood.getMaxExpectedSellingRate());
        existingPerishableGood.setQualityScore(updatedPerishableGood.getQualityScore());
        existingPerishableGood.setCurrentDemandLevel(updatedPerishableGood.getCurrentDemandLevel());

        return perishableGoodRepository.save(existingPerishableGood);
    }

    // Delete perishable good by Product ID
    public void deletePerishableGood(String productId) {
        PerishableGood perishableGood = perishableGoodRepository.findByProductId(productId)
                .orElseThrow(() -> new RuntimeException("Perishable Good not found for the given Product"));

        perishableGoodRepository.delete(perishableGood);
    }
}
