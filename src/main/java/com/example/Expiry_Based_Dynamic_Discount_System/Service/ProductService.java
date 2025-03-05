package com.example.Expiry_Based_Dynamic_Discount_System.Service;

import com.example.Expiry_Based_Dynamic_Discount_System.Entity.Product;
import com.example.Expiry_Based_Dynamic_Discount_System.Repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

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
    public Product updateProduct(String productId, Product updatedProduct) {
        return productRepository.findById(productId).map(existingProduct -> {
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
//            existingProduct.setImage_url(updatedProduct.getImage_url());

            return productRepository.save(existingProduct);
        }).orElseThrow(() -> new RuntimeException("Product not found with ID: " + productId));
    }

    // Delete a product
    public void deleteProduct(String productId) {
        productRepository.deleteById(productId);
    }
}
