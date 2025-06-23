import React from 'react';
import Slider from 'react-slick';
import './login-slider.scss';

function LoginSlider() {
    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        autoplay: true,
        autoplaySpeed: 4000,
        slidesToShow: 1,
        slidesToScroll: 1,
        arrows: false,
        adaptiveHeight: false,
    };

    const slides = [
        {
            img: "/images/auth/login-1.jpg",
        },
        {
            img: "/images/auth/login-2.jpg",
        },
        {
            img: "/images/auth/login-3.jpg",
        },
    ];

    return (
        <div className="login-slider rounded-4">
            <Slider {...settings}>
                {slides.map(({ img, title, desc }, idx) => (
                    <div key={idx} className="slide">
                        <div className="slide-content-wrapper rounded-4 h-100 d-flex align-items-end justify-content-center p-5 overflow-hidden" style={{ backgroundImage: `url(${img})` }} role="img" aria-label={title}>
                            <div className="slide-overlay position-absolute top-0 start-0 w-100 h-100 z-2"></div>
                            <div className="content position-relative z-3">
                                <h2>{title}</h2>
                                <p>{desc}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </Slider>
        </div>
    );
}

export default LoginSlider;
