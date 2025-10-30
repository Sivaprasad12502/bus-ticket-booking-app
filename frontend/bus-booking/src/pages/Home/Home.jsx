import React, { useState, useEffect } from "react";
import Navbar from "../../component/Navbar/Navbar";
import { BusSearch } from "../../component/BusSearch/BusSearch";
import { motion } from "framer-motion";
import {
  FaHeadset,
  FaMoneyBillWave,
  FaBusAlt,
  FaGift,
  FaShieldAlt,
  FaFemale,
  FaMapMarkerAlt,
  FaTag,
  FaStar,
  FaQuoteLeft,
  FaPhone,
  FaEnvelope,
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaLinkedin,
} from "react-icons/fa";
import { MdVerifiedUser, MdTrackChanges } from "react-icons/md";
import "./Home.scss";

const Home = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Promotional banners data
  const banners = [
    {
      id: 1,
      title: "Summer Sale 2025",
      subtitle: "Get up to 30% OFF on all bookings",
      image:
        "https://images.unsplash.com/photo-1527853787696-f7be74f2e39a?w=1200",
      color: "#d84e55",
    },
    {
      id: 2,
      title: "Festival Special",
      subtitle: "Book now and travel during holidays with extra comfort",
      image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1200",
      color: "#ff9800",
    },
    {
      id: 3,
      title: "First-Time User Bonus",
      subtitle: "Flat ₹200 OFF on your first booking",
      image:
        "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=1200",
      color: "#4caf50",
    },
  ];

  // Auto-slide carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  // Highlights data
  const highlights = [
    {
      icon: <FaHeadset />,
      title: "24/7 Customer Support",
      description: "Round-the-clock assistance for all your queries",
    },
    {
      icon: <FaMoneyBillWave />,
      title: "Instant Refunds",
      description: "Cancel anytime and get instant refunds",
    },
    {
      icon: <FaBusAlt />,
      title: "1000+ Verified Operators",
      description: "Travel with India's most trusted bus operators",
    },
    {
      icon: <FaGift />,
      title: "Exclusive Festival Offers 🎉",
      description: "Special discounts during festivals and holidays",
    },
  ];

  // Why Choose Us data
  const whyChooseUs = [
    {
      icon: <FaShieldAlt />,
      title: "Safe & Secure Payments",
      description:
        "Industry-leading encryption ensures your payment data is always protected with PCI-DSS compliance.",
    },
    {
      icon: <FaFemale />,
      title: "Women-Friendly Seats",
      description:
        "Dedicated women-only seats for safer and more comfortable travel experience.",
    },
    {
      icon: <MdTrackChanges />,
      title: "Live Bus Tracking",
      description:
        "Track your bus in real-time and share your journey with loved ones for peace of mind.",
    },
    {
      icon: <FaTag />,
      title: "Zero Booking Fees",
      description:
        "What you see is what you pay. No hidden charges, no surprises at checkout.",
    },
  ];

  // Testimonials data
  const testimonials = [
    {
      name: "Priya Sharma",
      location: "Mumbai",
      rating: 5,
      comment:
        "Amazing service! Booked my bus in minutes and the journey was super comfortable. The customer support team was very helpful.",
      avatar: "https://randomuser.me/api/portraits/women/32.jpg",
    },
    {
      name: "Rajesh Kumar",
      location: "Delhi",
      rating: 5,
      comment:
        "Best bus booking platform! I love the instant refund feature. Cancelled my booking and got the money back immediately.",
      avatar: "https://randomuser.me/api/portraits/men/45.jpg",
    },
    {
      name: "Anjali Patel",
      location: "Bangalore",
      rating: 5,
      comment:
        "The women-only seats feature is fantastic. I feel much safer traveling alone now. Highly recommend this platform!",
      avatar: "https://randomuser.me/api/portraits/women/68.jpg",
    },
  ];

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 60 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  return (
    <div className="homepage">
      <Navbar />

      <BusSearch />

      {/* Promotional Banner Carousel */}
      <section className="promo-carousel">
        <div className="carousel-container">
          <div
            className="carousel-track"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {banners.map((banner, index) => (
              <div
                key={banner.id}
                className="carousel-slide"
                style={{ backgroundImage: `url(${banner.image})` }}
              >
                {/* <div
                  className="carousel-overlay"
                  style={{
                    background: `linear-gradient(135deg, ${banner.color}dd, ${banner.color}99)`,
                  }}
                ></div> */}
                <div className="carousel-content">
                  <h2>{banner.title}</h2>
                  <p>{banner.subtitle}</p>
                  {/* <button className="carousel-btn">Book Now</button> */}
                </div>
              </div>
            ))}
          </div>
          {/* <div className="carousel-dots">
            {banners.map((_, index) => (
              <button
                key={index}
                className={`dot ${currentSlide === index ? "active" : ""}`}
                onClick={() => setCurrentSlide(index)}
              />
            ))}
          </div> */}
        </div>
      </section>

      {/* Advertisement/Highlights Section */}
      <motion.section
        className="highlights-section"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={staggerContainer}
      >
        <div className="container">
          <div className="highlights-grid">
            {highlights.map((highlight, index) => (
              <motion.div
                key={index}
                className="highlight-card"
                variants={fadeInUp}
              >
                <div className="highlight-icon">{highlight.icon}</div>
                <h3 className="highlight-title">{highlight.title}</h3>
                <p className="highlight-description">{highlight.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Why Choose Us Section */}
      <motion.section
        className="why-choose-section"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={staggerContainer}
      >
        <div className="container">
          <motion.h2 className="section-title" variants={fadeInUp}>
            Why Choose Us
          </motion.h2>
          <div className="why-choose-grid">
            {whyChooseUs.map((feature, index) => (
              <motion.div
                key={index}
                className="feature-card"
                variants={fadeInUp}
              >
                <div className="feature-icon">{feature.icon}</div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Testimonials Section */}
      <motion.section
        className="testimonials-section"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={staggerContainer}
      >
        <div className="container">
          <motion.h2 className="section-title" variants={fadeInUp}>
            What Our Travelers Say
          </motion.h2>
          <div className="testimonials-grid">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                className="testimonial-card"
                variants={fadeInUp}
              >
                <FaQuoteLeft className="quote-icon" />
                <div className="testimonial-rating">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <FaStar key={i} className="star-icon" />
                  ))}
                </div>
                <p className="testimonial-comment">{testimonial.comment}</p>
                <div className="testimonial-author">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="author-avatar"
                  />
                  <div className="author-info">
                    <h4 className="author-name">{testimonial.name}</h4>
                    <p className="author-location">{testimonial.location}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <div className="footer-logo">
              <FaBusAlt className="logo-icon" />
              <h3>BusBooking</h3>
            </div>
            <p className="footer-tagline">Your Journey, Our Responsibility</p>
            <p className="footer-description">
              India's most trusted bus booking platform with 1000+ verified
              operators and 1M+ happy travelers.
            </p>
          </div>

          <div className="footer-section">
            <h4 className="footer-heading">Quick Links</h4>
            <ul className="footer-links">
              <li>
                <a>About Us</a>
              </li>
              <li>
                <a>Contact</a>
              </li>
              <li>
                <a>Terms & Conditions</a>
              </li>
              <li>
                <a>Privacy Policy</a>
              </li>
              <li>
                <a>Refund Policy</a>
              </li>
            </ul>
          </div>

          <div className="footer-section">
            <h4 className="footer-heading">Contact Us</h4>
            <div className="contact-info">
              <div className="contact-item">
                <FaPhone className="contact-icon" />
                <span>+91 1800-123-4567</span>
              </div>
              <div className="contact-item">
                <FaEnvelope className="contact-icon" />
                <span>support@busbooking.com</span>
              </div>
              <div className="contact-item">
                <FaMapMarkerAlt className="contact-icon" />
                <span>sulthan Bathery, wayanad, kerala</span>
              </div>
            </div>
          </div>

          <div className="footer-section">
            <h4 className="footer-heading">Follow Us</h4>
            <div className="social-links">
              <a href="#facebook" className="social-link">
                <FaFacebook />
              </a>
              <a href="#twitter" className="social-link">
                <FaTwitter />
              </a>
              <a href="#instagram" className="social-link">
                <FaInstagram />
              </a>
              <a href="#linkedin" className="social-link">
                <FaLinkedin />
              </a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>
            &copy; {new Date().getFullYear()} BusBooking. All rights reserved.
          </p>
          <div className="payment-badges">
            <MdVerifiedUser className="badge-icon" />
            <span>Secure Payments</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
