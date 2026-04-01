const [showPopup, setShowPopup] = useState(false);

// used this when you want to show after click that button
const handleAssign = async () => {
  if (!selectedDeliveryBoy) {
    alert("Select a delivery boy!");
    return;
  }

  try {
    await dispatch(
      assignDeliveryBoyThunk({
        orderId: order._id,
        deliveryBoyId: selectedDeliveryBoy._id,
      })
    ).unwrap();

    setShowSidebar(false);

    // open popup
    setShowPopup(true);

    // close popup after 5 seconds
    setTimeout(() => {
      setShowPopup(false);
    }, 5000);

  } catch (error) {
    alert(error || "Failed to assign delivery boy");
  }
};

{showPopup && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
    <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl animate-[fadeIn_.3s_ease]">
      <div className="flex flex-col items-center text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <h2 className="text-xl font-bold text-gray-800">
          Delivery Boy Assigned
        </h2>

        <p className="mt-2 text-sm text-gray-500">
          The order has been assigned successfully.
        </p>

        <p className="mt-1 text-xs text-gray-400">
          This popup will close automatically in 5 seconds.
        </p>
      </div>
    </div>
  </div>
)}