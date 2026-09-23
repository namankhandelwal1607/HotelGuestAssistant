import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MessageList } from '../components/MessageList';
import { AvailabilityCard } from '../components/AvailabilityCard';
import { AvailabilityForm } from '../components/AvailabilityForm';
import { Message, RoomAvailabilityResult } from '../types';

// Mock scrollIntoView for jsdom
window.HTMLElement.prototype.scrollIntoView = jest.fn();

describe('Frontend Component Tests', () => {
  const sampleRoom: RoomAvailabilityResult = {
    roomTypeId: 'deluxe_king',
    name: 'Deluxe King Room',
    pricePerNight: 18500,
    maxOccupancy: 2,
    bedConfig: '1 King Bed',
    description: 'Spacious 380 sq ft room featuring an ultra-comfortable plush King pillow-top bed.',
    features: ['Balcony', 'Garden View', 'Nespresso Machine'],
    available: true,
    nights: 3,
    totalPrice: 55500,
    currency: 'INR'
  };

  test('Test 1: AvailabilityCard renders room specs, pricing, and available status', () => {
    render(<AvailabilityCard room={sampleRoom} />);

    expect(screen.getByText('Deluxe King Room')).toBeInTheDocument();
    expect(screen.getByText('₹18,500')).toBeInTheDocument();
    expect(screen.getByText('Available')).toBeInTheDocument();
    expect(screen.getByText('Select Room')).toBeInTheDocument();
    expect(screen.getByText(/55,500 total/i)).toBeInTheDocument();
  });

  test('Test 2: MessageList displays loading indicator when isLoading is true', () => {
    const messages: Message[] = [
      {
        id: 'msg-1',
        role: 'user',
        content: 'What time is check-in?',
        timestamp: new Date().toISOString()
      }
    ];

    render(
      <MessageList
        messages={messages}
        isLoading={true}
        onRetry={jest.fn()}
        onSubmitAvailability={jest.fn()}
      />
    );

    expect(screen.getByText('What time is check-in?')).toBeInTheDocument();
    expect(screen.getByText(/Concierge is checking.../i)).toBeInTheDocument();
  });

  test('Test 3: MessageList renders error state and triggers retry callback', () => {
    const onRetryMock = jest.fn();
    const messages: Message[] = [
      {
        id: 'error-msg-1',
        role: 'assistant',
        content: 'Message delivery failed due to network timeout.',
        timestamp: new Date().toISOString(),
        isError: true
      }
    ];

    render(
      <MessageList
        messages={messages}
        isLoading={false}
        onRetry={onRetryMock}
        onSubmitAvailability={jest.fn()}
      />
    );

    expect(screen.getAllByText(/Message delivery failed/i).length).toBeGreaterThan(0);
    const retryBtn = screen.getByRole('button', { name: /retry/i });
    expect(retryBtn).toBeInTheDocument();

    fireEvent.click(retryBtn);
    expect(onRetryMock).toHaveBeenCalledTimes(1);
  });

  test('Test 4: AvailabilityForm submits user-selected dates and guests', () => {
    const onSubmitMock = jest.fn();

    render(
      <AvailabilityForm
        missingFields={['checkIn', 'checkOut', 'adults']}
        onSubmit={onSubmitMock}
      />
    );

    const submitBtn = screen.getByRole('button', { name: /Check Live Room Availability/i });
    expect(submitBtn).toBeInTheDocument();

    fireEvent.click(submitBtn);
    expect(onSubmitMock).toHaveBeenCalled();
  });
});
