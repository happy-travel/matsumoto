import React, { useEffect } from "react";
import { getParams, API } from "core";
import { Loader } from "components/simple";
import { windowLocalStorage } from "core/misc/window-storage";
import { paymentCallback } from "tasks/payment/finalize";
import { directPaymentCallback } from "tasks/payment/direct/direct-finalize";

const Payment3DSecureCallbackPage = () => {
    useEffect(() => {
        const params = getParams();
        const directLinkCode = windowLocalStorage.get(params.merchant_reference);

        if (directLinkCode) {
            API.post({
                external_url: API.DIRECT_LINK_PAY.PAY_CALLBACK(directLinkCode),
                body: params,
                after: (data, error) => directPaymentCallback(data, error)
            });
            return;
        }

        API.post({
            url: API.PAYMENTS_CALLBACK,
            body: params,
            after: (data, error) => paymentCallback(data, error)
        });
    }, []);

    return (
        <>
            <Loader white page />
            { __devEnv &&
                <div className="development-block">
                    <a
                        className="button"
                        href={("http://localhost:4000" + window.location.pathname + window.location.search)}
                    >
                        Process to localhost
                    </a>
                </div>
            }
        </>
    );
};

export default Payment3DSecureCallbackPage;
