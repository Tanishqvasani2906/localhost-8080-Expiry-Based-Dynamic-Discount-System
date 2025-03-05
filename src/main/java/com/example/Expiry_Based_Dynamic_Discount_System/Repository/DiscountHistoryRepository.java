package com.example.Expiry_Based_Dynamic_Discount_System.Repository;

import com.example.Expiry_Based_Dynamic_Discount_System.Entity.DiscountHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface DiscountHistoryRepository extends JpaRepository<DiscountHistory, String> {
    @Query(value = "SELECT * FROM discount_history WHERE product_id = :productId ORDER BY applied_at DESC LIMIT 1", nativeQuery = true)
    List<DiscountHistory> findLatestDiscountByProductId(@Param("productId") String productId);

    @Query(value = "SELECT * FROM discount_history WHERE product_id = :productId ORDER BY applied_at DESC LIMIT 1", nativeQuery = true)
    DiscountHistory findLatestDiscountByProduct(@Param("productId") String productId);
}
