package com.example.Expiry_Based_Dynamic_Discount_System.Controller;

import com.example.Expiry_Based_Dynamic_Discount_System.Entity.EventProduct;
import com.example.Expiry_Based_Dynamic_Discount_System.Service.EventProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/eventProducts")
public class EventProductController {

    @Autowired
    private EventProductService eventProductService;

    // ✅ Add a new Event Product linked to a Product
    @PostMapping("/add/{productId}")
    public ResponseEntity<EventProduct> addEventProduct(@PathVariable String productId,
                                                        @RequestBody EventProduct eventProduct) {
        EventProduct savedEventProduct = eventProductService.addEventProduct(productId, eventProduct);
        return ResponseEntity.ok(savedEventProduct);
    }

    // ✅ Get all Event Products
    @GetMapping("/getAll")
    public ResponseEntity<List<EventProduct>> getAllEventProducts() {
        List<EventProduct> eventProducts = eventProductService.getAllEventProducts();
        return ResponseEntity.ok(eventProducts);
    }

    // ✅ Get an Event Product by Product ID
    @GetMapping("/getByProductId/{productId}")
    public ResponseEntity<EventProduct> getEventProductByProductId(@PathVariable String productId) {
        Optional<EventProduct> eventProduct = eventProductService.getEventProductByProductId(productId);
        return eventProduct.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // ✅ Update an Event Product by Product ID
    @PutMapping("/update/{productId}")
    public ResponseEntity<EventProduct> updateEventProduct(@PathVariable String productId,
                                                           @RequestBody EventProduct updatedEventProduct) {
        EventProduct updated = eventProductService.updateEventProduct(productId, updatedEventProduct);
        return ResponseEntity.ok(updated);
    }

    // ✅ Delete an Event Product by Product ID
    @DeleteMapping("/delete/{productId}")
    public ResponseEntity<Void> deleteEventProduct(@PathVariable String productId) {
        eventProductService.deleteEventProduct(productId);
        return ResponseEntity.noContent().build();
    }
}