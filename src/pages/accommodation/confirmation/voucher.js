import React, { useEffect, useState } from "react";
import { observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import { API } from "core";
import { INVOICE_TYPES } from "enum";
import { PassengerName, GroupRoomTypesAndCount, date } from "simple";
import { Loader } from "components/simple";
import { MealPlan } from "components/accommodation";
import Breadcrumbs from "components/breadcrumbs";
import Map from "components/map";
import { MODALS } from "enum/modals-enum";
import { $view } from "stores";

const AccommodationConfirmationVoucherPage = observer(({ match }) => {
    const [voucher, setVoucher] = useState(null);

    useEffect(() => {
        API.get({
            url: API.BOOKING_VOUCHER(match?.params?.id),
            success: setVoucher
        });
    }, []);

    useEffect(() => {
        document.title = (voucher?.referenceCode || "") + " Voucher Happytravel.com";
    });

    const showSendModal = () => {
        $view.setModal(
            MODALS.SEND_INVOICE,
            {
                type: INVOICE_TYPES.VOUCHER,
                bookingId: match?.params?.id
            }
        );
    };

    const { t } = useTranslation();

    if (!voucher)
        return <Loader page />;

    return (
        <div className="invoice">
            <div className="no-print">
                <Breadcrumbs
                    backLink={`/booking/${voucher.referenceCode}`}
                    backText={t("Back to") + " " + t("Booking Confirmation")}
                />
            </div>
            <div className="buttons no-print">
                <button className="button" onClick={window.print}>{t("Print")}</button>
                <button className="button" onClick={showSendModal}>{t("Send Voucher")}</button>
            </div>

            {voucher.logoUrl &&
                <div className="personal-logo">
                    <img src={voucher.logoUrl + "?" + Number(new Date())} alt="" />
                </div>
            }

            <div className="information">
                <div>Thank you, <PassengerName passenger={voucher.roomDetails?.[0].passengers?.[0]} /></div>
            </div>
            <div className="information">
                <div>We look forward to welcoming you at</div>
                <div>{voucher.accommodation.name}</div>
                <div>
                    {voucher.accommodation.location.address},{" "}
                    {voucher.accommodation.location.locality},{" "}
                    {voucher.accommodation.location.country}
                </div>
            </div>
            <div className="information">
                <div>Booking reference code: {voucher.referenceCode}</div>
            </div>

            <div className="box">
                <div className="title">Information About Your Stay</div>
                <div className="columns">
                    <div className="one">
                        <div className="text">{voucher.accommodation.name}</div>
                        <div>
                            {voucher.accommodation.location.address},{" "}
                            {voucher.accommodation.location.locality},{" "}
                            {voucher.accommodation.location.country},{" "}
                            {voucher.accommodation.contactInfo.phones.join(", ")}
                        </div>

                        <div className="text">Length of stay:</div>
                        <div>{__plural(t, voucher.nightCount, "Night")}</div>

                        <div className="text">Arrival Date:</div>
                        <div>
                            {date.format.c(voucher.checkInDate)},
                            {" "}{t("from")}{" "}
                            {voucher.accommodation.checkInTime}
                        </div>

                        <div className="text">Departure Date:</div>
                        <div>{date.format.c(voucher.checkOutDate)}</div>

                        <div className="text">Deadline Date:</div>
                        <div>{date.format.c(voucher.deadlineDate)}</div>

                        { !!voucher.roomDetails?.length && <>
                            <div className="text">Rooms Number:</div>
                            <div>{__plural(t, voucher.roomDetails.length, "Room")}</div>
                        </> }
                    </div>
                    <div className="two">
                        <Map
                            marker={voucher.accommodation.location.coordinates}
                        />
                    </div>
                </div>

                { voucher.roomDetails.map((room, index) => (
                    <div className="room-part" key={index}>
                        <div><GroupRoomTypesAndCount solo contracts={[room]} /></div>
                        <div className="main-passenger">
                            <PassengerName passenger={room.passengers[0]} />
                        </div>
                        { room.supplierRoomReferenceCode &&
                            <div>Room reference code: {room.supplierRoomReferenceCode}</div>
                        }
                        {(room.passengers.length > 1) &&
                            <div>
                                Other Guests:<br/>
                                {room.passengers.map( (item, index) => ( !!index &&
                                    <React.Fragment key={index}>
                                        <PassengerName passenger={ item } /><br/>
                                    </React.Fragment>
                                ))}
                            </div>
                        }
                        <div>Board basis: <MealPlan room={room} /></div>
                        { room?.remarks.map((item, index) => (
                            <div key={index}>
                                {!!item.key && <span>{item.key}:</span>} {item.value}
                            </div>
                        ))}
                    </div>
                ))}
            </div>

            {voucher.bannerUrl &&
                <div className="personal-b">
                    <img src={voucher.bannerUrl + "?" + Number(new Date())} alt="" />
                </div>
            }

            {!voucher.deadlineDate &&
                <div className="deadline-notify">
                    FREE Cancellation
                </div>
            }
            {date.isFuture(voucher.deadlineDate) &&
                <div className="deadline-notify">
                    FREE Cancellation until {date.format.c(voucher.deadlineDate)}
                </div>
            }
        </div>
    );
});

export default AccommodationConfirmationVoucherPage;
