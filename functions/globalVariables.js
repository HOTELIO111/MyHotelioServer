const bookingGlobalVariableForRoom = (data) => {
  global[data.room] = {
    bookingDate: data?.bookingDate,
    numberOfRooms: data?.numberOfRooms,
  };
};

const FindGlobalAndMatch = (data) => {
  const _findData = global[data?.room];
  const bookingCheckIn = new Date(_findData.bookingDate.checkIn);
  const bookingCheckOut = new Date(_findData?.bookingDate?.checkOut);
  const dataCheckIn = new Date(data.bookingDate.checkIn);
  const dataCheckOut = new Date(data.bookingDate.checkOut);

  return {
    status: bookingCheckIn >= dataCheckIn && bookingCheckOut <= dataCheckOut,
    data: _find,
  };
};

module.exports = { bookingGlobalVariableForRoom, FindGlobalAndMatch };
