package com.example.demo;

import com.example.demo.model.Book;
import com.example.demo.model.User;
import com.example.demo.repository.BookRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;

@SpringBootApplication
public class DemoApplication {

	public static void main(String[] args) {
		SpringApplication.run(DemoApplication.class, args);
	}

	@Bean
	public CommandLineRunner demo(BookRepository bookRepo, UserRepository userRepo, PasswordEncoder passwordEncoder) {
		return (args) -> {
			// Delete old admin user if it exists
			User oldAdmin = userRepo.findByUsername("admin");
			if (oldAdmin != null) {
				userRepo.delete(oldAdmin);
			}

			if (userRepo.findByUsername("sourabh_admin") == null) {
				User admin = new User();
				admin.setUsername("sourabh_admin");
				admin.setPassword(passwordEncoder.encode("NannaPustaka@2024"));
				admin.setRole("ADMIN");
				admin.setFirstName("Admin");
				userRepo.save(admin);
			}

			if (bookRepo.count() == 0) {
				bookRepo.save(new Book("The Great Gatsby", "F. Scott Fitzgerald", "Fiction", new BigDecimal("499.00"), "A classic novel about the American Dream.", "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1490528560i/4671.jpg", 10));
				bookRepo.save(new Book("To Kill a Mockingbird", "Harper Lee", "Fiction", new BigDecimal("599.00"), "A gripping story of justice and innocence.", "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1553383690i/2657.jpg", 15));
				bookRepo.save(new Book("The Alchemist", "Paulo Coelho", "Fiction", new BigDecimal("399.00"), "A journey of self-discovery.", "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1654371463i/112503.jpg", 20));
			}
		};
	}
}
