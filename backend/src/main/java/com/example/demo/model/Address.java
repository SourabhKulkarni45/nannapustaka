package com.example.demo.model;

import jakarta.persistence.Embeddable;

@Embeddable
public class Address {
    private String houseNumber;
    private String houseName;
    private String landmark;
    private String city;
    private String state;
    private String pinCode;

    // Default constructor is required by JPA
    public Address() {}

    public Address(String houseNumber, String houseName, String landmark, String city, String state, String pinCode) {
        this.houseNumber = houseNumber;
        this.houseName = houseName;
        this.landmark = landmark;
        this.city = city;
        this.state = state;
        this.pinCode = pinCode;
    }

    public String getHouseNumber() { return houseNumber; }
    public void setHouseNumber(String houseNumber) { this.houseNumber = houseNumber; }

    public String getHouseName() { return houseName; }
    public void setHouseName(String houseName) { this.houseName = houseName; }

    public String getLandmark() { return landmark; }
    public void setLandmark(String landmark) { this.landmark = landmark; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getState() { return state; }
    public void setState(String state) { this.state = state; }

    public String getPinCode() { return pinCode; }
    public void setPinCode(String pinCode) { this.pinCode = pinCode; }
}
