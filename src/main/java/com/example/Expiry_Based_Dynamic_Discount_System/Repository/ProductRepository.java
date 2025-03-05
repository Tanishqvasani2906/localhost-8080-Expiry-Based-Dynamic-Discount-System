package com.example.Expiry_Based_Dynamic_Discount_System.Repository;

import com.example.Expiry_Based_Dynamic_Discount_System.Entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductRepository extends JpaRepository<Product, String> {
}
