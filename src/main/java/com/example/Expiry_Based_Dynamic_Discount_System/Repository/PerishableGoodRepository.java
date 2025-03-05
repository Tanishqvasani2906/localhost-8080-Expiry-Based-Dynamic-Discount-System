package com.example.Expiry_Based_Dynamic_Discount_System.Repository;

import com.example.Expiry_Based_Dynamic_Discount_System.Entity.PerishableGood;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface PerishableGoodRepository extends JpaRepository<PerishableGood, String> {
    @Query("SELECT p FROM PerishableGood p WHERE p.product.product_id = :productId")
    Optional<PerishableGood> findByProductId(@Param("productId") String productId);
}
