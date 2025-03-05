package com.example.Expiry_Based_Dynamic_Discount_System.Controller;

import com.example.Expiry_Based_Dynamic_Discount_System.Entity.Product;
import com.example.Expiry_Based_Dynamic_Discount_System.Service.DiscountService;
import com.example.Expiry_Based_Dynamic_Discount_System.Service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/discounts")
public class DiscountController {

    @Autowired
    private DiscountService discountService;

    @Autowired
    private ProductService productService;

    // ✅ Apply discount to a specific product and return JSON response
    @PostMapping("/apply/{productId}")
    public ResponseEntity<Map<String, Object>> applyDiscount(@PathVariable String productId) {
        return productService.getProductById(productId)
                .map(product -> {
                    BigDecimal discountedPrice = discountService.calculateAndApplyDiscount(product);

                    // 🔹 Creating JSON response
                    Map<String, Object> response = new HashMap<>();
                    response.put("productId", product.getProduct_id());
                    response.put("productName", product.getName());
                    response.put("originalPrice", product.getBasePrice());
                    response.put("discountedPrice", discountedPrice);
                    response.put("discountPercentage", product.getCurrentProfitMargin());
                    response.put("image-url", product.getImage_url());

                    return ResponseEntity.ok(response);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // ✅ Apply discount to ALL products in the database and return JSON response
    @PostMapping("/apply/all")
    public ResponseEntity<List<Map<String, Object>>> applyDiscountToAllProducts() {
        List<Product> allProducts = productService.getAllProducts();
        List<Map<String, Object>> discountResults = allProducts.stream().map(product -> {
            BigDecimal discountedPrice = discountService.calculateAndApplyDiscount(product);

            // 🔹 Creating JSON response for each product
            Map<String, Object> response = new HashMap<>();
            response.put("productId", product.getProduct_id());
            response.put("productName", product.getName());
            response.put("originalPrice", product.getBasePrice());
            response.put("discountedPrice", discountedPrice);
            response.put("discountPercentage", product.getCurrentProfitMargin());
            response.put("image-url", product.getImage_url());

            return response;
        }).toList();

        return ResponseEntity.ok(discountResults);
    }
}
