import React from "react";
import { useTranslation } from "react-i18next";
import { Redirect } from "react-router-dom";
import { observer } from "mobx-react";
import InfiniteScroll from "react-infinite-scroll-component";
import { API } from "core";

import {
    GroupRoomTypesAndCount, MealPlan, Stars, Loader, PassengersCount, price
} from "simple";
import Breadcrumbs from "components/breadcrumbs";
import Deadline from "components/deadline";

import AccommodationFilters from "parts/accommodation-filters";
import { loadCurrentSearch } from "parts/search/search-logic";
import AccommodationTitlePage from "./title";

import store from "stores/accommodation-store";

@observer
class AccommodationVariantsPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            redirectToRoomContractSetsPage: false,
            loading: false
        };
        this.loadNextPage = this.loadNextPage.bind(this);
    }

    accommodationSelect(accommodation) {
        this.setState({
            loading: true
        });

        store.setSelectedAccommodationFullDetails(null);
        API.get({
            url: API.ACCOMMODATION_DETAILS(
                accommodation.accommodationDetails.id,
                accommodation.source
            ),
            success: result => store.setSelectedAccommodationFullDetails(result)
        });

        API.post({
            url: API.A_SEARCH_STEP_TWO(
                accommodation.availabilityId,
                accommodation.accommodationDetails.id,
                accommodation.source
            ),
            success: result => {
                store.selectAccommodation(result);
                this.setState({
                    redirectToRoomContractSetsPage: true
                });
            },
            after: () => {
                this.setState({
                    loading: false
                });
            }
        });
    }

    loadNextPage() {
        loadCurrentSearch((store.search.page || 0) + 1);
    }

    render() {
        const { t } = useTranslation();

        if (this.state.redirectToRoomContractSetsPage)
            return <Redirect push to="/search/contract" />;

        if (!store?.search?.request?.destination)
            return <AccommodationTitlePage />;

        return (

<React.Fragment>
    <div class="variants block">
        { store?.search?.loading === true ?
        <Loader /> :
        <section class="double-sections">
            <AccommodationFilters />
            <div class="right-section">
                <div class="head">
                    <div class="title">
                        <h3>
                            {t("Results for")} <b>{ store.search.request.destination }</b>

                            {!!store.hotelArray.length &&
                                <span>&nbsp;({store.hotelArray.length}
                                    { !!store.search.length && <React.Fragment>
                                        &nbsp;{t("out of")} {store.search.length}{
                                        store.search.status == "PartiallyCompleted" ? "+" : ""
                                        } {t("available")}
                                    </React.Fragment> })
                                </span>
                            }
                        </h3>
                        <Breadcrumbs noBackButton items={[
                            {
                                text: t("Find Accommodation"),
                                link: '/'
                            }, {
                                text: store.search.request.destination
                            }
                        ]}/>
                        { !store.hotelArray.length && !store?.search?.loading &&
                            <h3>
                                <span>
                                    {t("No accommodations available")}
                                </span>
                            </h3>
                        }
                    </div>
                    { /* todo:
                    <div class="sorter">
                        <button class="button-expand">
                            {t("Sort by")}
                        </button>
                    </div>
                    <div class="input-wrap">
                        <div class="form">
                            <FieldText
                                placeholder={t("Search by a hotel name...")}
                            />
                        </div>
                    </div>
                    */ }
                </div>

                { (store.search?.loading == "__filter_tmp") && <Loader page /> }

                { (!store.hotelArray.length && !store?.search?.loading && !store.filtersLine) &&
                    <div style={{ paddingTop: "50px" }}>
                        <div class="head">
                            <div class="title">
                                <h3>{t("Found nothing?")}</h3>
                                <br/>
                                {t("You could reach our Operations team directly, and we pick an accommodation for you.")}
                                <br/>
                                <br/>
                                {t("Email")}: <a href="mailto:info@happytravel.com" class="link">info@happytravel.com</a>
                            </div>
                        </div>
                    </div> }

                { this.state.loading && <Loader page /> }

                <InfiniteScroll
                    dataLength={store.hotelArray.length}
                    next={this.loadNextPage}
                    hasMore={store.search.hasMoreVariants}
                    loader={(store.search?.loading !== "__filter_tmp") ? <Loader /> : null}
                >
                { store.hotelArray.map(item =>
                <div class="variant" key={item.accommodationDetails.id}>
                    <div class="summary" onClick={() => this.accommodationSelect(item)}>
                        { item.accommodationDetails.picture.source && <div class="photo">
                            <img src={item.accommodationDetails.picture.source} alt="" />
                        </div> }
                        <div class="title">
                            <h2>
                                <u>{item.accommodationDetails.name}</u>
                                <Stars count={item.accommodationDetails.rating} />
                            </h2>
                            <div class="category">
                                {t("Accommodation in")} {item.accommodationDetails.location.country}, {item.accommodationDetails.location.locality}<br/>
                                {item.accommodationDetails.location.address}
                            </div>
                            { /*
                            <div class="features">
                                <span class="icon icon-info-big"/>
                                <span class="icon icon-map" />
                                <span class="button pink mini-label">{t("Preferred")}</span>
                            </div>
                            */ }
                        </div>
                        <div class="prices">
                            <div class="from">{t("From")}</div>
                            <div class="value">{price(item.roomContractSets?.[0]?.price.currency, item.fromPrice)}</div>
                        </div>
                    </div>
                    <div class="table">
                        <div class="title">
                            {t("Recommended option for")
                            } <PassengersCount t={t}
                                               adults={store.search.request.roomDetails.reduce((res,item) => (res+item.adultsNumber), 0)}
                                               children={store.search.request.roomDetails.reduce((res,item) => (res+item.childrenNumber), 0)}/>
                        </div>
                        <div class="billet">
                            <div class="count">
                                {__plural(t, store.search.numberOfNights, "Night")}
                                , <PassengersCount t={t}
                                                   adults={store.search.request.roomDetails.reduce((res,item) => (res+item.adultsNumber), 0)}
                                                   children={store.search.request.roomDetails.reduce((res,item) => (res+item.childrenNumber), 0)}
                                                   separator={", "} />
                            </div>
                            <div class="price">
                                <span>{t("From")}</span> {price(item.roomContractSets?.[0]?.price)}
                            </div>
                            <button class="button small" onClick={() => this.accommodationSelect(item)}>
                                {t("Choose Room")}
                            </button>
                        </div>
                        { item.roomContractSets.slice(0, 2).map(roomContractSet => <div class="row">
                            <div class="main">
                                <h3 onClick={() => this.accommodationSelect(item)}>
                                    <GroupRoomTypesAndCount t={t} contracts={roomContractSet.roomContracts} />
                                </h3>
                                <div>
                                    {roomContractSet.roomContracts[0]?.isDynamic === true &&
                                        <strong>
                                            {t("Dynamic offer")}
                                        </strong>
                                    }
                                    <Deadline t={t}
                                        roomContractSet={roomContractSet}
                                        availabilityId={item.availabilityId}
                                        source={item.source}
                                    />
                                </div>
                                <div class="info green">
                                    <MealPlan t={t} room={roomContractSet.roomContracts[0]} />
                                </div>
                            </div>
                        </div>) }
                    </div>
                </div>) }
                </InfiniteScroll>
                {(store.search.status != "Completed") && <Loader />}
            </div>
        </section> }
    </div>
</React.Fragment>
);
    }
}

export default AccommodationVariantsPage;
