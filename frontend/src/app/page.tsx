'use client';

import React, { useRef } from 'react';
import { HotelNavbar } from '../components/hotel/HotelNavbar';
import { HotelHero } from '../components/hotel/HotelHero';
import { BookingBar } from '../components/hotel/BookingBar';
import { HotelExperience } from '../components/hotel/HotelExperience';
import { RoomsSection } from '../components/hotel/RoomsSection';
import { AmenitiesSection } from '../components/hotel/AmenitiesSection';
import { AssistantCallout } from '../components/hotel/AssistantCallout';
import { HotelFooter } from '../components/hotel/HotelFooter';
import {
  FloatingHotelAssistant,
  FloatingHotelAssistantHandle,
} from '../components/hotel/FloatingHotelAssistant';

export default function Home() {
  const assistantRef = useRef<FloatingHotelAssistantHandle>(null);

  const scrollToBooking = () => {
    const el = document.getElementById('booking-bar');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToRooms = () => {
    const el = document.getElementById('rooms');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleBookingSearch = (checkIn: string, checkOut: string, adults: number) => {
    const query = `Check room availability from ${checkIn} to ${checkOut} for ${adults} guest${
      adults > 1 ? 's' : ''
    }`;
    assistantRef.current?.openChat(query);
  };

  const handleSelectRoom = (roomName: string) => {
    const query = `I would like to check availability and details for the ${roomName}`;
    assistantRef.current?.openChat(query);
  };

  const handleOpenChat = (query?: string) => {
    assistantRef.current?.openChat(query);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-amber-100 selection:text-amber-900">
      {/* 1. Header / Navbar */}
      <HotelNavbar onCheckAvailabilityClick={scrollToBooking} />

      <main className="flex-1">
        {/* 2. Full-Width Hero Section */}
        <HotelHero
          onCheckAvailabilityClick={scrollToBooking}
          onExploreRoomsClick={scrollToRooms}
        />

        {/* 3. Availability / Booking Bar */}
        <BookingBar onSearch={handleBookingSearch} />

        {/* 4. Hotel Experience / Intro Section */}
        <HotelExperience />

        {/* 5. Rooms & Suites Section */}
        <RoomsSection onSelectRoom={handleSelectRoom} />

        {/* 6. Hotel Amenities Section */}
        <AmenitiesSection />

        {/* 7. Virtual Assistant Callout Banner */}
        <AssistantCallout onOpenChat={handleOpenChat} />
      </main>

      {/* 8. Footer */}
      <HotelFooter onCheckAvailabilityClick={scrollToBooking} />

      {/* Floating 24/7 Hotel Assistant Widget */}
      <FloatingHotelAssistant ref={assistantRef} initialOpen={false} />
    </div>
  );
}
