package com.example.Expiry_Based_Dynamic_Discount_System.Controller;

import com.example.Expiry_Based_Dynamic_Discount_System.Entity.Product;
import com.example.Expiry_Based_Dynamic_Discount_System.Service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/products")
public class ProductController {

    @Autowired
    private ProductService productService;

    // Create a new product (Only Admin)
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/addProduct")
    public ResponseEntity<Product> createProduct(@RequestBody Product product) {
        Product savedProduct = productService.addProduct(product);
        return ResponseEntity.ok(savedProduct);
    }

    // Get all products (Accessible to all)
    @GetMapping("/getAllProducts")
    public ResponseEntity<List<Product>> getAllProducts() {
        List<Product> products = productService.getAllProducts();
        return ResponseEntity.ok(products);
    }

    // Get a product by ID (Accessible to all)
    @GetMapping("/getByProductId/{productId}")
    public ResponseEntity<Product> getProductById(@PathVariable String productId) {
        Optional<Product> product = productService.getProductById(productId);
        return product.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Update a product (Only Admin)
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/updateByProductId/{productId}")
    public ResponseEntity<Product> updateProduct(@PathVariable String productId, @RequestBody Product updatedProduct) {
        try {
            Product updated = productService.updateProduct(productId, updatedProduct);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
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
