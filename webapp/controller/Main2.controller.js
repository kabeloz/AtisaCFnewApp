sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/Fragment",
    "sap/ui/model/Sorter",
    "sap/m/MessageToast"
], (Controller, JSONModel, Filter, FilterOperator, Fragment, Sorter, MessageToast) => {
    "use strict";

    return Controller.extend("cf.app.controller.Main2", {
        onInit: function () {

            var oThirdPartyModel = new JSONModel("model/ThirdParty.json");
            this.getView().setModel(oThirdPartyModel, "thirdParty");


        },
        onItemPress: async function (oEvent) {

            var oItem = oEvent.getParameter("listItem");

            if (!oItem) {
                console.error("❌ No list item selected");
                return;
            }

            console.log("✅ Item pressed:", oItem.getTitle());

            // Get CustomData
            var aCustomData = oItem.getCustomData();

            console.log("CustomData:", aCustomData);

            var sRoute = null;

            aCustomData.forEach(function (oData) {
                if (oData.getKey() === "route") {
                    sRoute = oData.getValue();
                }
            });

            console.log("🚀 Route:", sRoute);

            if (!sRoute) {
                console.error(" No route found for:", oItem.getTitle());
                return;
            }

            var sTitle = oItem.getTitle();

            // Show loading dialog if available
            if (this._showLoading) {
                await this._showLoading(
                    "Please wait, " + sTitle + " is loading..."
                );
            }

            console.log("➡️ Navigating to:", sRoute);

            this.getOwnerComponent()
                .getRouter()
                .navTo(sRoute);
        },
        _showLoading: async function (sMessage) {

            if (!this._oLoadingDialog) {

                this._oLoadingDialog = await this.loadFragment({
                    name: "cf.app.fragment.Loading"
                });

                this.getView().addDependent(this._oLoadingDialog);
            }

            Fragment.byId(
                this.getView().getId(),
                "loadingText"
            ).setText(sMessage);

            this._oLoadingDialog.open();

            return new Promise(function (resolve) {

                setTimeout(function () {

                    this._oLoadingDialog.close();

                    resolve();

                }.bind(this), 700);

            }.bind(this));
        },

        onStageFilterChange: function (oEvent) {

            var sSelectedKey = oEvent.getSource().getSelectedKey();

            var oTable = this.byId("_IDGenTable");
            var oBinding = oTable.getBinding("rows");

            if (!oBinding) {
                console.error("Table rows binding not found.");
                return;
            }

            // Show all stages
            if (sSelectedKey === "ALL") {
                oBinding.filter([]);
                return;
            }

            var oFilter = new sap.ui.model.Filter(
                "Status",
                sap.ui.model.FilterOperator.EQ,
                sSelectedKey
            );

            oBinding.filter([oFilter]);
        },
        onSort: function (oEvent) {

            if (!this._oSortPopover) {

                this._oSortPopover = new sap.m.Popover({
                    title: "Sort Table",
                    placement: sap.m.PlacementType.Bottom,
                    contentWidth: "250px",

                    content: [

                        new sap.m.VBox({
                            class: "sapUiSmallMargin",
                            items: [

                                new sap.m.Label({
                                    text: "Sort by:"
                                }),

                                new sap.m.Select({
                                    id: this.createId("sortColumnSelect"),
                                    width: "100%",
                                    selectedKey: "Employer_Name",
                                    items: [

                                        new sap.ui.core.Item({
                                            key: "Employer_Name",
                                            text: "Employer Name"
                                        }),

                                        new sap.ui.core.Item({
                                            key: "Registration_Number",
                                            text: "Registration No"
                                        }),

                                        new sap.ui.core.Item({
                                            key: "Province",
                                            text: "Province"
                                        }),

                                        new sap.ui.core.Item({
                                            key: "Last_Login",
                                            text: "Last Login"
                                        }),

                                        new sap.ui.core.Item({
                                            key: "Industry",
                                            text: "Industry"
                                        }),

                                        new sap.ui.core.Item({
                                            key: "Employees",
                                            text: "Number of Employees"
                                        }),

                                        new sap.ui.core.Item({
                                            key: "Active_Claims",
                                            text: "Active Claims"
                                        }),

                                        new sap.ui.core.Item({
                                            key: "Pending_Claims",
                                            text: "Pending Claims"
                                        }),

                                        new sap.ui.core.Item({
                                            key: "Total_Payments",
                                            text: "Total Payments"
                                        }),

                                        new sap.ui.core.Item({
                                            key: "Director_Name",
                                            text: "Director"
                                        }),

                                        new sap.ui.core.Item({
                                            key: "Company_Registration_Date",
                                            text: "Registered"
                                        }),

                                        new sap.ui.core.Item({
                                            key: "Submitted_Date",
                                            text: "Submitted"
                                        }),

                                        new sap.ui.core.Item({
                                            key: "Contact_Person",
                                            text: "Contact Person"
                                        }),

                                        new sap.ui.core.Item({
                                            key: "Closed_Claims",
                                            text: "Closed Claims"
                                        }),

                                        new sap.ui.core.Item({
                                            key: "Compliance_Status",
                                            text: "Compliance Status"
                                        }),

                                        new sap.ui.core.Item({
                                            key: "Status",
                                            text: "Status"
                                        })
                                    ]
                                }),

                                new sap.m.Label({
                                    text: "Order:",
                                    class: "sapUiSmallMarginTop"
                                }),

                                new sap.m.Select({
                                    id: this.createId("sortOrderSelect"),
                                    width: "100%",
                                    selectedKey: "ASC",
                                    items: [

                                        new sap.ui.core.Item({
                                            key: "ASC",
                                            text: "Ascending"
                                        }),

                                        new sap.ui.core.Item({
                                            key: "DESC",
                                            text: "Descending"
                                        })
                                    ]
                                }),

                                new sap.m.Button({
                                    text: "Apply Sort",
                                    type: "Emphasized",
                                    icon: "sap-icon://sort",
                                    width: "100%",
                                    class: "sapUiSmallMarginTop",
                                    press: this.applySort.bind(this)
                                })
                            ]
                        })
                    ]
                });

                this.getView().addDependent(this._oSortPopover);
            }

            this._oSortPopover.openBy(oEvent.getSource());
        },


        applySort: function () {

    var oTable = this.byId("_IDGenTable");

    if (!oTable) {
        console.error("Table '_IDGenTable' was not found.");
        return;
    }

    var oBinding = oTable.getBinding("rows");

    if (!oBinding) {
        console.error("Table rows binding not found.");
        return;
    }

    var oColumnSelect = this.byId("sortColumnSelect");
    var oOrderSelect = this.byId("sortOrderSelect");

    if (!oColumnSelect || !oOrderSelect) {
        console.error("Sort controls were not found.");
        return;
    }

    var sPath = oColumnSelect.getSelectedKey();
    var bDescending = oOrderSelect.getSelectedKey() === "DESC";

    var oSorter = new sap.ui.model.Sorter(
        sPath,
        bDescending
    );

    oBinding.sort(oSorter);

    MessageToast.show(
        "Sorted by " +
        oColumnSelect.getSelectedItem().getText() +
        " (" +
        (bDescending ? "Descending" : "Ascending") +
        ")"
    );

    this._oSortPopover.close();
},



        statusState: function (sStatus) {
            switch (sStatus) {
                case "Active":
                    return "Success";

                case "Pending":
                    return "Warning";

                case "Inactive":
                    return "Error";

                default:
                    return "None";
            }
        },

        onSearchEmployer: function (oEvent) {

            

            var sValue = oEvent.getParameter("newValue") ||
                oEvent.getParameter("query");

            var oTable = this.byId("_IDGenTable");
            var oBinding = oTable.getBinding("rows");

             if (!oBinding) {
                    return;
                }

                if (!sValue) {
                    oBinding.filter([]);
                    return;
                }

                sValue = String(sValue).trim();

            var aFilters = [

                new Filter("Employer_Name", FilterOperator.Contains, sValue),
                new Filter("Registration_Number", FilterOperator.Contains, sValue),
                new Filter("Province", FilterOperator.Contains, sValue),
                new Filter("Industry", FilterOperator.Contains, sValue),
                new Filter("Director_Name", FilterOperator.Contains, sValue),
                new Filter("Contact_Person", FilterOperator.Contains, sValue),
                new Filter("Email", FilterOperator.Contains, sValue),
                new Filter("Status", FilterOperator.Contains, sValue),
                new Filter("Compliance_Status", FilterOperator.Contains, sValue),
                new Filter("Last_Login", FilterOperator.Contains, sValue),
                new Filter("Submitted_Date", FilterOperator.Contains, sValue),
                new Filter("Company_Registration_Date", FilterOperator.Contains, sValue)

            ];

             // Numeric field
                    if (!isNaN(sValue)) {

                        aFilters.push(
                            new Filter(
                                "Total_Payments",
                                FilterOperator.EQ,
                                Number(sValue)
                            )
                        );

                    }

                    var oCombinedFilter = new Filter({
                        filters: aFilters,
                        and: false
                    });

                    oBinding.filter(oCombinedFilter);

        }

    })
});