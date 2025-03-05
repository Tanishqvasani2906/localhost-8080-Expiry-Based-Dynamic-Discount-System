package com.example.Expiry_Based_Dynamic_Discount_System.Controller;

import com.example.Expiry_Based_Dynamic_Discount_System.Entity.PerishableGood;
import com.example.Expiry_Based_Dynamic_Discount_System.Service.PerishableGoodService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/perishableGoods")
public class PerishableGoodController {

    @Autowired
    private PerishableGoodService perishableGoodService;

    // Add a new Perishable Good linked to a Product
    @PostMapping("/add/{productId}")
    public ResponseEntity<PerishableGood> addPerishableGood(@PathVariable String productId,
                                                            @RequestBody PerishableGood perishableGood) {
        PerishableGood savedPerishableGood = perishableGoodService.addPerishableGood(productId, perishableGood);
        return ResponseEntity.ok(savedPerishableGood);
    }

    // Get all Perishable Goods
    @GetMapping("/getAll")
    public ResponseEntity<List<PerishableGood>> getAllPerishableGoods() {
        List<PerishableGood> perishableGoods = perishableGoodService.getAllPerishableGoods();
        return ResponseEntity.ok(perishableGoods);
    }

    // Get Perishable Good by Product ID
    @GetMapping("/getByProductId/{productId}")
    public ResponseEntity<PerishableGood> getPerishableGoodByProductId(@PathVariable String productId) {
        Optional<PerishableGood> perishableGood = perishableGoodService.getPerishableGoodByProductId(productId);
        return perishableGood.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Update Perishable Good by Product ID
    @PutMapping("/update/{productId}")
    public ResponseEntity<PerishableGood> updatePerishableGood(@PathVariable String productId,
                                                               @RequestBody PerishableGood updatedPerishableGood) {
        PerishableGood updated = perishableGoodService.updatePerishableGood(productId, updatedPerishableGood);
        return ResponseEntity.ok(updated);
    }

    // Delete Perishable Good by Product ID
    @DeleteMapping("/delete/{productId}")
    public ResponseEntity<Void> deletePerishableGood(@PathVariable String productId) {
        perishableGoodService.deletePerishableGood(productId);
        return ResponseEntity.noContent().build();
    }
}
