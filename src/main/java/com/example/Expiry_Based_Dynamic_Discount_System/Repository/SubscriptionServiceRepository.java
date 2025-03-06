package com.example.Expiry_Based_Dynamic_Discount_System.Repository;

import com.example.Expiry_Based_Dynamic_Discount_System.Entity.SubscriptionService;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SubscriptionServiceRepository extends JpaRepository<SubscriptionService, String> {
    // ✅ Ensure product_id is correctly queried as String
    @Query(value = "SELECT * FROM subscription_services WHERE product_id = :productId", nativeQuery = true)
    Optional<SubscriptionService> findByProductId(@Param("productId") String productId);
}
