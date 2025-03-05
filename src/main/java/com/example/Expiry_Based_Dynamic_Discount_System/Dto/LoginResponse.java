package com.example.Expiry_Based_Dynamic_Discount_System.Dto;

import lombok.NoArgsConstructor;

//@Data
//@AllArgsConstructor
@NoArgsConstructor
public class LoginResponse {
    public LoginResponse(String token, String userId) {
        this.token = token;
        this.userId = userId;
    }

    private String token; // JWT token

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    private String userId;
}
