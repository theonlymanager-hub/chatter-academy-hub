import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { Home, Plus, Trash2, ExternalLink } from "lucide-react";
import { format, parseISO, differenceInDays } from "date-fns";

interface AirbnbBooking {
  id: string;
  account_id: string;
  booking_url: string;
  check_in_date: string;
  check_out_date: string;
  location: string;
  price_gbp: number;
  booking_status: "pending" | "confirmed" | "completed" | "cancelled";
  shoot_type: string;
  notes: string | null;
  created_at: string;
}

const accountNames = {
  ashley: "Ashley",
  willow: "Willow",
  izzie: "Izzie"
};

export default function AirbnbBookingTracker() {
  const [bookings, setBookings] = useState<AirbnbBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newBooking, setNewBooking] = useState({
    account_id: "ashley",
    booking_url: "",
    check_in_date: "",
    check_out_date: "",
    location: "",
    price_gbp: 0,
    shoot_type: "content",
    notes: ""
  });

  useEffect(() => {
    fetchBookings();
  }, []);

  async function fetchBookings() {
    try {
      const { data, error } = await supabase
        .from("airbnb_bookings")
        .select("*")
        .order("check_in_date", { ascending: true });

      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
    } finally {
      setLoading(false);
    }
  }

  async function addBooking() {
    if (!newBooking.location || !newBooking.check_in_date || !newBooking.check_out_date) {
      alert("Please fill in location and dates");
      return;
    }

    try {
      const { error } = await supabase
        .from("airbnb_bookings")
        .insert({
          ...newBooking,
          booking_status: "pending"
        });

      if (error) throw error;

      setNewBooking({
        account_id: "ashley",
        booking_url: "",
        check_in_date: "",
        check_out_date: "",
        location: "",
        price_gbp: 0,
        shoot_type: "content",
        notes: ""
      });
      setShowAddForm(false);
      fetchBookings();
    } catch (error) {
      console.error("Failed to add booking:", error);
      alert("Failed to add booking");
    }
  }

  async function deleteBooking(id: string) {
    try {
      const { error } = await supabase
        .from("airbnb_bookings")
        .delete()
        .eq("id", id);

      if (error) throw error;
      fetchBookings();
    } catch (error) {
      console.error("Failed to delete booking:", error);
    }
  }

  async function updateStatus(id: string, status: string) {
    try {
      const { error } = await supabase
        .from("airbnb_bookings")
        .update({ booking_status: status })
        .eq("id", id);

      if (error) throw error;
      fetchBookings();
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  }

  const upcomingBookings = bookings.filter(b => 
    b.booking_status !== "completed" && 
    b.booking_status !== "cancelled" &&
    new Date(b.check_in_date) >= new Date()
  );

  const urgentBookings = upcomingBookings.filter(b => {
    const daysUntil = differenceInDays(parseISO(b.check_in_date), new Date());
    return daysUntil <= 7 && daysUntil >= 0;
  });

  return (
    <div className="space-y-6">
      {urgentBookings.length > 0 && (
        <Card className="border-orange-500 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-orange-800">⚠️ Upcoming This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {urgentBookings.map(booking => {
                const daysUntil = differenceInDays(parseISO(booking.check_in_date), new Date());
                return (
                  <div key={booking.id} className="p-3 bg-white rounded border border-orange-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-medium">{accountNames[booking.account_id as keyof typeof accountNames]}</span>
                        <span className="text-sm text-muted-foreground ml-2">
                          {booking.location} • {format(parseISO(booking.check_in_date), "MMM d")}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-orange-600">
                        {daysUntil === 0 ? "TODAY" : `${daysUntil} days`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Home className="w-5 h-5" />
            Airbnb Bookings
          </CardTitle>
          <Button onClick={() => setShowAddForm(!showAddForm)}>
            <Plus className="w-4 h-4 mr-2" />
            New Booking
          </Button>
        </CardHeader>
        <CardContent>
          {showAddForm && (
            <div className="mb-6 p-4 border rounded space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Account</label>
                  <select
                    value={newBooking.account_id}
                    onChange={(e) => setNewBooking({ ...newBooking, account_id: e.target.value })}
                    className="w-full p-2 border rounded"
                  >
                    <option value="ashley">Ashley</option>
                    <option value="willow">Willow</option>
                    <option value="izzie">Izzie</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Shoot Type</label>
                  <select
                    value={newBooking.shoot_type}
                    onChange={(e) => setNewBooking({ ...newBooking, shoot_type: e.target.value })}
                    className="w-full p-2 border rounded"
                  >
                    <option value="content">Content Shoot</option>
                    <option value="custom">Custom</option>
                    <option value="collab">Collab</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Location</label>
                <Input
                  value={newBooking.location}
                  onChange={(e) => setNewBooking({ ...newBooking, location: e.target.value })}
                  placeholder="Brighton, UK"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Check-in</label>
                  <Input
                    type="date"
                    value={newBooking.check_in_date}
                    onChange={(e) => setNewBooking({ ...newBooking, check_in_date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Check-out</label>
                  <Input
                    type="date"
                    value={newBooking.check_out_date}
                    onChange={(e) => setNewBooking({ ...newBooking, check_out_date: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Price (£)</label>
                  <Input
                    type="number"
                    value={newBooking.price_gbp}
                    onChange={(e) => setNewBooking({ ...newBooking, price_gbp: parseFloat(e.target.value) })}
                    placeholder="100"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Booking URL</label>
                  <Input
                    value={newBooking.booking_url}
                    onChange={(e) => setNewBooking({ ...newBooking, booking_url: e.target.value })}
                    placeholder="https://airbnb.com/..."
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Notes</label>
                <Input
                  value={newBooking.notes}
                  onChange={(e) => setNewBooking({ ...newBooking, notes: e.target.value })}
                  placeholder="Additional details..."
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={addBooking} className="flex-1">Add Booking</Button>
                <Button variant="outline" onClick={() => setShowAddForm(false)}>Cancel</Button>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {loading ? (
              <p className="text-muted-foreground text-sm">Loading...</p>
            ) : bookings.length === 0 ? (
              <p className="text-muted-foreground text-sm">No bookings yet</p>
            ) : (
              bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="p-4 border rounded space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">
                          {accountNames[booking.account_id as keyof typeof accountNames]}
                        </span>
                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                          {booking.shoot_type}
                        </span>
                        <select
                          value={booking.booking_status}
                          onChange={(e) => updateStatus(booking.id, e.target.value)}
                          className={`text-xs px-2 py-1 rounded border-0 ${
                            booking.booking_status === "pending" ? "bg-yellow-100 text-yellow-800" :
                            booking.booking_status === "confirmed" ? "bg-green-100 text-green-800" :
                            booking.booking_status === "completed" ? "bg-gray-100 text-gray-800" :
                            "bg-red-100 text-red-800"
                          }`}
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                      <div className="text-sm space-y-1">
                        <p className="font-medium">{booking.location}</p>
                        <p className="text-muted-foreground">
                          {format(parseISO(booking.check_in_date), "MMM d, yyyy")} → {format(parseISO(booking.check_out_date), "MMM d, yyyy")}
                        </p>
                        <p className="text-muted-foreground">£{booking.price_gbp}</p>
                        {booking.notes && <p className="text-sm italic">{booking.notes}</p>}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {booking.booking_url && (
                        <a href={booking.booking_url} target="_blank" rel="noopener noreferrer">
                          <Button variant="ghost" size="sm">
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </a>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteBooking(booking.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
