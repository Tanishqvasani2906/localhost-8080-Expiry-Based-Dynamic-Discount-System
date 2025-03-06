package com.example.Expiry_Based_Dynamic_Discount_System.Controller;

import com.example.Expiry_Based_Dynamic_Discount_System.Entity.DiscountHistory;
import com.example.Expiry_Based_Dynamic_Discount_System.Entity.Product;
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

@RestController
@RequestMapping("/products")
public class ProductController {

    @Autowired
    private ProductService productService;
    @Autowired
    private DiscountService discountService;

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
        List<Product> allProducts = productService.getAllProducts();

        List<Map<String, Object>> mergedResults = allProducts.stream().map(product -> {
            BigDecimal discountedPrice = discountService.calculateAndApplyDiscount(product);

            // 🔹 Merging Product and Discount Data into JSON Response
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

            // 🔹 Adding Discount Details
            response.put("discountedPrice", discountedPrice);
            response.put("discountPercentage", product.getCurrentProfitMargin());

            return response;
        }).toList();

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
