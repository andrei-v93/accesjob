import React from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import './MainSlider.scss';

const images = [
    'slide-1.jpg',
    'slide-2.jpg',
    'slide-3.jpg',
    // adaugă aici numele fișierelor tale din /public/images
];

function ImageSlider() {
    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
    };

    return (
        <Slider {...settings} className={"main-slider"}>
            {images.map((img, index) => (
                <div key={index}>
                    <img
                        src={`/images/${img}`}
                        alt={`Slide ${index + 1}`}
                        className={"object-fit-cover w-100"}
                    />
                </div>
            ))}
        </Slider>
    );
}

export default ImageSlider;
