import React, { useEffect, useMemo, useState } from 'react';
import { roomAPI, roomTypeAPI, locationAPI, bookingAPI, propertyAPI } from '../../services/api';
import { formatCurrency, calculateDays } from '../../utils/helpers';

const toDateInputValue = (date) => date.toISOString().slice(0, 10);

const todayValue = toDateInputValue(new Date());
const tomorrowValue = toDateInputValue(new Date(Date.now() + 24 * 60 * 60 * 1000));

const initialForm = {
  property: '',
  roomType: '',
  location: '',
  locationSearch: '',
  checkInDate: todayValue,
  checkOutDate: tomorrowValue,
  numberOfGuests: 1,
};

const CustomerRooms = () => {
  const [properties, setProperties] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [locations, setLocations] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('ALL');
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const fetchSearchData = async () => {
      try {
        const [propertiesResponse, locationsResponse] = await Promise.all([
          propertyAPI.getProperties(),
          locationAPI.getLocations(),
        ]);

        const activeProperties = propertiesResponse.data.properties || [];
        const availableLocations = locationsResponse.data.locations || [];
        const firstProperty = activeProperties[0] || null;

        setProperties(activeProperties);
        setLocations(availableLocations);

        if (firstProperty) {
          const roomTypesResponse = await roomTypeAPI.getAllRoomTypes({ property: firstProperty._id });
          const propertyRoomTypes = roomTypesResponse.data.roomTypes || [];
          setRoomTypes(propertyRoomTypes);
          setForm((prev) => ({
            ...prev,
            property: firstProperty._id,
            roomType: propertyRoomTypes[0]?._id || '',
            location: firstProperty.location?._id || firstProperty.location || '',
          }));
        }
      } catch (error) {
        setMessage({
          type: 'error',
          text: 'Unable to load properties right now.',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSearchData();
  }, []);

  const selectedProperty = useMemo(
    () => properties.find((property) => property._id === form.property) || null,
    [properties, form.property]
  );

  const selectedRoomType = useMemo(
    () => roomTypes.find((roomType) => roomType._id === form.roomType) || null,
    [roomTypes, form.roomType]
  );

  const filteredProperties = useMemo(() => {
    const needle = form.locationSearch.trim().toLowerCase();

    return properties.filter((property) => {
      const matchesType = selectedTypeFilter === 'ALL' || property.type === selectedTypeFilter;
      if (!matchesType) return false;

      if (!needle) return true;
      const location = property.location || {};
      return [property.name, property.type, location.name, location.city, location.address]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(needle));
    });
  }, [properties, form.locationSearch, selectedTypeFilter]);

  const estimatedTotal = useMemo(() => {
    if (!selectedRoomType || !form.checkInDate || !form.checkOutDate) return 0;
    const days = Math.max(1, calculateDays(form.checkInDate, form.checkOutDate));
    return selectedRoomType.pricePerDay * days;
  }, [selectedRoomType, form.checkInDate, form.checkOutDate]);

  const selectProperty = async (property) => {
    setMessage({ type: '', text: '' });
    setAvailableRooms([]);

    try {
      const response = await roomTypeAPI.getAllRoomTypes({ property: property._id });
      const propertyRoomTypes = response.data.roomTypes || [];
      setRoomTypes(propertyRoomTypes);
      setForm((prev) => ({
        ...prev,
        property: property._id,
        roomType: propertyRoomTypes[0]?._id || '',
        location: property.location?._id || property.location || '',
      }));
    } catch (error) {
      setMessage({ type: 'error', text: 'Unable to load room types for this property.' });
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === 'numberOfGuests' ? Number(value) : value,
    }));
  };

  const handleSearch = async (event) => {
    event.preventDefault();
    setMessage({ type: '', text: '' });

    if (!form.property || !form.roomType || !form.checkInDate || !form.checkOutDate) {
      setMessage({ type: 'error', text: 'Please select a property, room type, and dates.' });
      return;
    }

    if (form.checkInDate < todayValue) {
      setMessage({ type: 'error', text: 'Check-in date cannot be in the past.' });
      return;
    }

    if (new Date(form.checkInDate) >= new Date(form.checkOutDate)) {
      setMessage({ type: 'error', text: 'Check-out date must be after check-in date.' });
      return;
    }

    setSearching(true);
    try {
      const response = await roomAPI.getAvailableRooms(
        form.property,
        form.roomType,
        form.location,
        form.checkInDate,
        form.checkOutDate,
        form.numberOfGuests
      );

      setAvailableRooms(response.data.rooms || []);
      if (!response.data.rooms?.length) {
        setMessage({ type: 'info', text: 'No rooms are available for the selected dates.' });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Unable to search rooms.',
      });
      setAvailableRooms([]);
    } finally {
      setSearching(false);
    }
  };

  const handleBooking = async (roomId) => {
    if (!form.property || !form.roomType || !form.checkInDate || !form.checkOutDate) {
      setMessage({ type: 'error', text: 'Please complete the booking details before submitting.' });
      return;
    }

    setSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await bookingAPI.createBooking({
        property: form.property,
        roomType: form.roomType,
        location: form.location,
        checkInDate: form.checkInDate,
        checkOutDate: form.checkOutDate,
        numberOfGuests: form.numberOfGuests,
        roomId,
      });

      setMessage({
        type: 'success',
        text: response.data.message || 'Booking request created successfully.',
      });
      setAvailableRooms([]);
      setForm((prev) => ({ ...prev, checkInDate: todayValue, checkOutDate: tomorrowValue }));
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Booking could not be created.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 bg-[#DDDCDB] min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-[#3C4044]">Search Rooms</h1>
          <p className="text-[#3C4044]/70 mt-2">Select a property, choose dates, and check availability.</p>
        </div>

        <div className="card-surface rounded-2xl p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#3C4044] mb-2">Search Location or Property</label>
            <input
              list="location-options"
              name="locationSearch"
              value={form.locationSearch}
              onChange={handleChange}
              placeholder="Type city, location, hotel, PG..."
              className="w-full border border-[#DDDCDB] rounded-xl px-3 py-2.5 bg-white text-[#3C4044] focus:outline-none focus:ring-2 focus:ring-[#FD7B41]"
            />
            <datalist id="location-options">
              {locations.map((location) => (
                <option key={location._id} value={`${location.name} ${location.city}`} />
              ))}
              {properties.map((property) => (
                <option key={property._id} value={property.name} />
              ))}
            </datalist>
          </div>

          {/* Accommodation Type Filters */}
          <div>
            <label className="block text-xs font-bold text-[#3C4044] uppercase tracking-wider mb-2">
              Filter by Type
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { value: 'ALL', label: 'All Types' },
                { value: 'HOTEL', label: '🏨 Hotels' },
                { value: 'PG', label: '🏠 PGs' },
                { value: 'HOSTEL', label: '🎒 Hostels' },
                { value: 'GUEST_HOUSE', label: '🏡 Guest Houses' },
                { value: 'DORMITORY', label: '🛏️ Dormitories' },
              ].map((tab) => (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => setSelectedTypeFilter(tab.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    selectedTypeFilter === tab.value
                      ? 'bg-[#FD7B41] text-white shadow-sm'
                      : 'bg-[#F5F3F1] text-[#3C4044] hover:bg-[#DDDCDB]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="text-[#3C4044]/70">Loading properties...</div>
          ) : filteredProperties.length === 0 ? (
            <div className="text-[#3C4044]/70">No properties match your filter and search criteria.</div>
          ) : (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3">
              {filteredProperties.map((property) => (
                <button
                  key={property._id}
                  type="button"
                  onClick={() => selectProperty(property)}
                  className={`text-left border rounded-xl p-4 bg-white transition ${
                    form.property === property._id
                      ? 'border-[#FD7B41] ring-2 ring-[#FD7B41]/30'
                      : 'border-[#DDDCDB] hover:border-[#FD7B41]/50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="text-lg font-bold text-[#3C4044]">{property.name}</h2>
                    <span className="shrink-0 rounded-full bg-[#EDBF9B] px-2 py-1 text-xs font-bold text-[#3C4044]">
                      {property.type}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-[#3C4044]/70">
                    {[property.location?.name, property.location?.city].filter(Boolean).join(' - ') || 'Location pending'}
                  </p>
                  <p className="mt-2 text-xs font-semibold text-[#3C4044]/70 flex items-center gap-1.5">
                    <span
                      className={`inline-block w-2 h-2 rounded-full ${
                        property.approvalMode === 'AUTOMATIC' ? 'bg-emerald-500' : 'bg-amber-500'
                      }`}
                    />
                    Approval: <strong className="text-[#3C4044]">{property.approvalMode}</strong>
                    <span className="text-[#3C4044]/50">
                      ({property.approvalMode === 'AUTOMATIC' ? 'Instant' : 'Review'})
                    </span>
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>

        <form onSubmit={handleSearch} className="card-surface rounded-2xl p-6 space-y-5">
          <div className="grid md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#3C4044] mb-2">Selected Property</label>
              <select
                name="property"
                value={form.property}
                onChange={(event) => {
                  const property = properties.find((item) => item._id === event.target.value);
                  if (property) selectProperty(property);
                }}
                className="w-full border border-[#DDDCDB] rounded-xl px-3 py-2.5 bg-white text-[#3C4044] focus:outline-none focus:ring-2 focus:ring-[#FD7B41]"
                required
              >
                {properties.map((property) => (
                  <option key={property._id} value={property._id}>
                    {property.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#3C4044] mb-2">Room Type</label>
              <select
                name="roomType"
                value={form.roomType}
                onChange={handleChange}
                className="w-full border border-[#DDDCDB] rounded-xl px-3 py-2.5 bg-white text-[#3C4044] focus:outline-none focus:ring-2 focus:ring-[#FD7B41]"
                required
              >
                {roomTypes.map((roomType) => (
                  <option key={roomType._id} value={roomType._id}>
                    {roomType.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#3C4044] mb-2">Check-In</label>
              <input
                type="date"
                name="checkInDate"
                min={todayValue}
                value={form.checkInDate}
                onChange={handleChange}
                className="w-full border border-[#DDDCDB] rounded-xl px-3 py-2.5 bg-white text-[#3C4044] focus:outline-none focus:ring-2 focus:ring-[#FD7B41]"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#3C4044] mb-2">Check-Out</label>
              <input
                type="date"
                name="checkOutDate"
                min={form.checkInDate || todayValue}
                value={form.checkOutDate}
                onChange={handleChange}
                className="w-full border border-[#DDDCDB] rounded-xl px-3 py-2.5 bg-white text-[#3C4044] focus:outline-none focus:ring-2 focus:ring-[#FD7B41]"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#3C4044] mb-2">Guests</label>
              <input
                type="number"
                name="numberOfGuests"
                min="1"
                max={selectedRoomType?.capacity || 20}
                value={form.numberOfGuests}
                onChange={handleChange}
                className="w-full border border-[#DDDCDB] rounded-xl px-3 py-2.5 bg-white text-[#3C4044] focus:outline-none focus:ring-2 focus:ring-[#FD7B41]"
              />
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="text-sm text-[#3C4044]/70">
              {selectedRoomType && selectedProperty ? (
                <>
                  {selectedProperty.name}: <span className="font-semibold text-[#3C4044]">{formatCurrency(estimatedTotal || selectedRoomType.pricePerDay)}</span> estimated total
                </>
              ) : 'Select a property and room type to estimate the price.'}
            </div>
            <button
              type="submit"
              disabled={searching || loading}
              className="px-5 py-2.5 rounded-xl bg-[#FD7B41] text-white font-semibold hover:bg-[#e76d35] disabled:opacity-60"
            >
              {searching ? 'Searching...' : 'Check Availability'}
            </button>
          </div>
        </form>

        {message.text && (
          <div
            className={`rounded-xl px-4 py-3 text-sm ${
              message.type === 'success'
                ? 'bg-emerald-100 text-emerald-700'
                : message.type === 'error'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-blue-100 text-blue-700'
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="card-surface rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-[#DDDCDB] bg-white/80">
            <h2 className="text-xl font-bold text-[#3C4044]">Available Rooms</h2>
          </div>

          {availableRooms.length === 0 ? (
            <div className="p-8 text-center text-[#3C4044]/70">
              Choose a property and search dates to see available rooms.
            </div>
          ) : (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4 p-6">
              {availableRooms.map((room) => (
                <div key={room._id} className="border border-[#DDDCDB] rounded-2xl p-4 bg-white">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-[#3C4044]">{room.roomNumber}</h3>
                    <span className="px-2 py-1 bg-[#EDBF9B] text-[#3C4044] text-xs font-semibold rounded-full">
                      {room.roomType?.name}
                    </span>
                  </div>

                  <div className="mt-4 space-y-2 text-sm text-[#3C4044]/70">
                    <p>Property: {room.property?.name || selectedProperty?.name}</p>
                    <p>Floor: {room.floor}</p>
                    <p>Capacity: {room.capacity} guests</p>
                    <p>Price: {formatCurrency(room.roomType?.pricePerDay || 0)} / night</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleBooking(room._id)}
                    disabled={submitting}
                    className="mt-5 w-full px-4 py-2.5 rounded-xl bg-[#3C4044] text-white font-semibold hover:bg-[#2b2f33] disabled:opacity-60"
                  >
                    {submitting ? 'Booking...' : 'Book This Room'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerRooms;
