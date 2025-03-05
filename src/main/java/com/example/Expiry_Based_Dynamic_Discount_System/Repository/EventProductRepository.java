package com.example.Expiry_Based_Dynamic_Discount_System.Repository;

import com.example.Expiry_Based_Dynamic_Discount_System.Entity.EventProduct;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EventProductRepository extends JpaRepository<EventProduct, String> {
    @Query("SELECT e FROM EventProduct e WHERE e.product.product_id = :productId")
    Optional<EventProduct> findByProductId(@Param("productId") String productId);// Fetch by Product ID
}

