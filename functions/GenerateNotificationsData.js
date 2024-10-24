const GenerateNotificatonsData = (data) => {
  const generatedData = {
    customer: {
      ...data.customer,
      recipient: data?.customer?.email,
      mobile: data?.customer?.mobileNo,
    },
    admin: {
      ...data.admin,
      recipient: process.env.SENDEREMAIL,
      mobile: process.env.ADMINMOBILE,
      inAppId: process.env.ADMIN,
    },
    partner: {
      ...data.partner,
      recipient: data?.partner?.email,
      mobile: data?.partner?.mobileNo,
      inAppId: data?.partner?._id,
    },
    agent: {
      ...data.agent,
      recipient: data?.agent?.email,
      mobile: data.agent?.mobileNo,
      inAppId: data?.agent?._id,
    },
  };

  return generatedData;
};

module.exports = GenerateNotificatonsData;
