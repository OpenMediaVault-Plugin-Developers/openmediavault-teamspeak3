/**
 * Copyright (C) 2013-2015 OpenMediaVault Plugin Developers
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

// require("js/omv/WorkspaceManager.js")
// require("js/omv/workspace/form/Panel.js")
// require("js/omv/data/Store.js")
// require("js/omv/data/Model.js")
// require("js/omv/form/plugin/LinkedFields.js")

Ext.define("OMV.module.admin.service.teamspeak3.Settings", {
    extend   : "OMV.workspace.form.Panel",
    uses : [
        "OMV.data.Model",
        "OMV.data.Store",
        "OMV.module.admin.service.teamspeak3.UpdateTS3"
    ],

    rpcService   : "Teamspeak3",
    rpcGetMethod : "getSettings",
    rpcSetMethod : "setSettings",

    plugins      : [{
        ptype        : "linkedfields",
        correlations : [{
            name       : [
                "main",
                "webui",
            ],
            conditions : [
                { name  : "eula", value : false }
            ],
            properties : "!show"
        },{
            name       : [
                "updatets3a",
            ],
            conditions : [
                { name  : "update", value : false }
            ],
            properties : "!show"
        },{
            name       : [
                "update",
                "eula",
            ],
            properties : "!show"
        },{
            name       : [
                "eulamain",
            ],
            conditions : [
                { name  : "eula", value : true }
            ],
            properties : "!show"
        },{
            name : [
                "enablewi"
            ],
            conditions  : [{
                name : "enablewi",
                value : true
            }],
            properties : function(valid, field) {
                this.setButtonDisabled("webinterface", !valid);
            }
        }]
    }],

    initComponent : function () {
        var me = this;

        me.on("load", function () {
            var checked = me.findField("enable").checked;
            var showtab = me.findField("showtab").checked;
            var parent = me.up("tabpanel");

            if (!parent)
                return;

            var managementPanel = parent.down("panel[title=" + _("Web Interface") + "]");

            if (managementPanel) {
                checked ? managementPanel.enable() : managementPanel.disable();
                showtab ? managementPanel.tab.show() : managementPanel.tab.hide();
            }
        });

        me.callParent(arguments);
    },

    getButtonItems : function() {
        var me = this;
        var items = me.callParent(arguments);
        items.push({
            id       : me.getId() + "-webinterface",
            xtype    : "button",
            text     : _("TS3 Webinterface"),
            icon     : "images/teamspeak3.png",
            iconCls  : Ext.baseCSSPrefix + "btn-icon-16x16",
            disabled : true,
            scope    : me,
            handler  : function() {
				var me = this;
                           window.open("/ts3wi/");
            }
        });
        return items;
    },

    getFormItems : function() {
        var me = this;

        return [{
            xtype	: "fieldset",
            title	: "General settings",
			name	: "main",
            defaults : {
                labelSeparator : ""
            },
            items : [{
                xtype      : "checkbox",
                name       : "enable",
                fieldLabel : _("Enable"),
                checked    : false,
                plugins: [{
                    ptype: "fieldinfo",
                    text: _("Please check if you need a licence <a href='http://sales.teamspeakusa.com/licensing.php' target='_blank'>Licensing information</a>"),
                }]
            },{
                xtype: "passwordfield",
                name: "password",
                fieldLabel: _("ServerQuery Admin Password"),
                allowBlank: true,
                editable:   false,
                autoCreate: {
                    tag: "textarea",
                    autocomplete: "off",
                    rows: "3",
                    cols: "65"
                },
                    plugins: [{
                        ptype: "fieldinfo",
                        text: _("This is your TS3 admin and webui password."),
                    }]
            },{
                xtype: "numberfield",
                name: "vsport",
                fieldLabel: _("Voice Port"),
                vtype: "port",
                minValue: 1,
                maxValue: 65535,
                allowDecimals: false,
                allowBlank: false,
                value: 9987,
                    plugins: [{
                        ptype: "fieldinfo",
                        text: _("Default port: UDP 9987")
                    }]
            },{
                xtype: "numberfield",
                name: "queryport",
                fieldLabel: _("Query Port"),
                vtype: "port",
                minValue: 1,
                maxValue: 65535,
                allowDecimals: false,
                allowBlank: false,
                value: 10011,
                    plugins: [{
                        ptype: "fieldinfo",
                        text: _("Default port: TCP 10011")
                    }]
            },{
                xtype: "numberfield",
                name: "fileport",
                fieldLabel: _("File Server Port"),
                vtype: "port",
                minValue: 1,
                maxValue: 65535,
                allowDecimals: false,
                allowBlank: false,
                value: 30033,
                    plugins: [{
                        ptype: "fieldinfo",
                        text: _("Default port: TCP 30033")
                    }]
            }]
        },{
            xtype    : "fieldset",
            title    : _("TS3 management site"),
            name     : "webui",
            defaults : {
                labelSeparator : ""
            },
            items : [{
                xtype      : "checkbox",
                name       : "enablewi",
                fieldLabel : _("Enable"),
                boxLabel: _("TS3 management site."),
                checked    : false,
                plugins    : [{
                    ptype : "fieldinfo",
                    text  : _("For more information see: <a href='http://interface.ts-rent.de/smf/' target='_blank'>TeamSpeak 3 Webinterface Support Forum</a>")
                }]
            },{
                xtype: "checkbox",
                name: "showtab",
                fieldLabel: _("Enable"),
                boxLabel: _("Show tab containing ts3 webui frame."),
                checked: false
            },{
                xtype      : "combo",
                name       : "languagewi",
                fieldLabel : _("Language"),
                mode       : "local",
                store      : new Ext.data.SimpleStore({
                    fields  : [ "value", "text" ],
                    data    : [
                        [ "de", _("German") ],
                        [ "en", _("English") ],
                        [ "nl", _("Dutch") ],
                        [ "fr", _("French") ]
                    ]
                }),
                displayField  : "text",
                valueField    : "value",
                allowBlank    : false,
                editable      : false,
                triggerAction : "all",
                value         : "en"
            }]
        },{
            xtype: "fieldset",
            title: _("Update settings"),
            name: "updatets3a",
            fieldDefaults: {
                labelSeparator: ""
            },
            items: [{
                xtype   : "checkbox",
                name    : "eula"
            },{
                xtype   : "checkbox",
                name    : "update"
            },{
                xtype: "textfield",
                name: "restartmsg",
                fieldLabel: _("Restart message"),
                allowBlank: true,
                autoCreate: {
                    tag: "textarea",
                    autocomplete: "off",
                    rows: "3",
                    cols: "65"
                },
                    plugins: [{
                        ptype: "fieldinfo",
                        text: _("The message which will be sent to warn users on the server."),
                    }]
            },{
                xtype   : "button",
                name    : "updatets3",
                text    : _("Update Teamspeak"),
                scope   : this,
                handler : function() {
                    var me = this;
                    OMV.MessageBox.show({
                        title   : _("Confirmation"),
                        msg     : _("Are you sure you want to update Teamspeak?"),
                        buttons : Ext.Msg.YESNO,
                        fn      : function(answer) {
                            if (answer !== "yes")
                               return;

                            OMV.Rpc.request({
                                scope   : me,
                                rpcData : {
                                    service : "Teamspeak3",
                                    method  : "doUpdateTS3",
                                    params  : {
                                        update   : 0
                                    }
                                },
                                success : function(id, success, response) {
                                    me.doReload();
                                    OMV.MessageBox.hide();
                                }
                            });
                        },
                        scope : me,
                        icon  : Ext.Msg.QUESTION
                    });
                },
                     margin : "0 0 5 0"
            }]
        },{
            xtype: "fieldset",
            title: _("Teamspeak EULA"),
            name: "eulamain",
            fieldDefaults: {
                labelSeparator: ""
            },
            items: [{xtype   : "button",
                name    : "updatets3",
                text    : _("Show Teamspeak EULA"),
                scope   : this,
                handler : function() {
                    var me = this;
                    OMV.MessageBox.show({
                        title   : _("Do you agree to the Teamspeak EULA?"),
                        msg     : _("<div style='width: 500px; height: 400px; overflow: auto; font-size-adjust: none; font-stretch: normal;'>" +
"<span class='small'>Revised: February 1st, 2013</span><br>" +
"<br>" +
"THIS IS A LEGAL AGREEMENT between 'you', the individual, company, or organization utilizing TeamSpeak brand software, TeamSpeak Systems GmbH, a Kr&uuml;n, Germany based company, and TeamSpeak Systems, Inc., a California, USA based Corporation.<br>" +
"<br>" +
"USE OF TEAMSPEAK SOFTWARE INDICATES YOUR ACCEPTANCE OF THESE TERMS.<br>" +
"<br>" +
"As used in this Agreement, the term 'TeamSpeak software' means TeamSpeak version 3.x voice communication software, both client and server, as made available from www.TeamSpeak.com together with any and all enhancements, upgrades, or updates that may be provided to you by TeamSpeak Systems GmbH.<br>" +
"<br>" +
"<strong>1. APPLICABLE LAW</strong><br>" +
"<br>" +
"All terms in this Agreement relating to ownership, distribution, prohibited conduct, or upgrades to TeamSpeak software, specifically Sections 2, 6, 11, and 12, will be handled by TeamSpeak Systems GmbH in accordance with the laws of Kr&uuml;n, Germany.<br>" +
"<br>" +
"TeamSpeak Systems, Inc. is TeamSpeak Systems GmbH's official sales, licensing, and billing entity for TeamSpeak software. As such, all terms in this Agreement relating to TeamSpeak sales, billing, compliance with licensing, including related issues such as piracy or banning of servers, will be handled by TeamSpeak Systems, Inc. in accordance with the laws within the State of California, USA.<br>" +
"<br>" +
"<strong>2. OWNERSHIP</strong><br>" +
"<br>" +
"Ownership of TeamSpeak software and any accompanying documentation shall at all times remain with TeamSpeak Systems GmbH. This Agreement does not constitute the sale of TeamSpeak software or any accompanying documentation, or any portion thereof. Without limiting the generality of the foregoing, you do not receive any rights to any patents, copyrights, trade secrets, trademarks or other intellectual property rights relating to TeamSpeak software or any accompanying documentation. All rights not expressly granted to you under this Agreement are reserved by TeamSpeak Systems GmbH.<br>" +
"<br>" +
"<strong>3. DEFINITIONS</strong><br>" +
"<br>" +
"<em>3.1 TeamSpeak Client and Server</em><br>" +
"TeamSpeak software consists of both a TeamSpeak Client and TeamSpeak Server application. The TeamSpeak Server is the application which acts as a host and allows two or more client connections to communicate with one another. The TeamSpeak Client is the application which connects to the TeamSpeak Server and contains end-user functionality which includes initiating a data stream for voice communication with another client connection. Sample screenshots of both the TeamSpeak Client and Server applications can be found at http://www.teamspeak.com/?page=screenshots.<br>" +
"<br>" +
"<em>3.2 TeamSpeak Software Development Kit (TeamSpeak SDK)</em><br>" +
"TeamSpeak software may also consist of a Software Development Kit or SDK. The TeamSpeak SDK is a set of development tools and documentation which allows software engineers to create customized or integrated applications typically as part of an existing product or service. The TeamSpeak SDK includes API information, sample code, tools, documentation, and other related items.<br>" +
"<br>" +
"<em>3.3 TeamSpeak Virtual Server</em><br>" +
"A TeamSpeak Virtual Server is any instance within the TeamSpeak Server application (binary executable) which allows the TeamSpeak Client application to connect. A single executed TeamSpeak Server application (binary executable) will by default create a single Virtual Server. However, the TeamSpeak Server application is capable of creating and hosting multiple Virtual Servers within any single running binary executable, where each server contains its own configuration properties which to the end-user may appear to act as a stand-alone server.<br>" +
"<br>" +
"<em>3.4 TeamSpeak Server Slot</em><br>" +
"A TeamSpeak Server Slot (or just 'slot') is utilized when a single TeamSpeak Client connection is established to any given TeamSpeak Virtual Server. The maximum 'slots' or 'slot count' can be individually configured for each Virtual Server and defines the maximum number of users that can simultaneously connect to that Virtual Server at any given time. For example, a Virtual Server configured for 10 slots will allow up to 10 simultaneous user connections before it generates a 'server full' error message to the 11th user attempting to connect to the same Virtual Server.<br>" +
"<br>" +
"<em>3.5 Commercial Entity</em><br>" +
"A commercial entity is an individual, company, or organization which demonstrates (typically via but not limited to a website) that it is in business to turn a profit of any kind; be it monetary, from direct sales or rental fees, advertising profit, or through the privileged use of intangible goods and services.<br>" +
"<br>" +
"<em>Example of a Commercial Entity:</em><br>" +
"A hosting company or organization which charges a monthly fee for the use of a TeamSpeak server OR a hosting company or organization which does NOT charge a monthly fee for the use of a TeamSpeak server but earns substantial profit from advertising, or from other products or services of any kind.<br>" +
"<br>" +
"<em>Example of a Commercial Entity profiting from advertising:</em><br>" +
"An organization advertising for products or services offered by a hosting company in exchange for the use of a TeamSpeak server means the hosting company will be considered to be a commercial entity, even if they choose not to charge anything at all for the use of any of their TeamSpeak servers. This situation is commonly referred to as a clan or guild 'sponsorship'.<br>" +
"<br>" +
"<em>Example of a Commercial Entity profiting from intangible goods:</em><br>" +
"A 'payment' is made to an individual or hosting company using virtual currency (gold, etc.) within a popular massively multiplayer online game (MMOG) in exchange for the use of a TeamSpeak server means the individual or hosting company will be considered to be a commercial entity.<br>" +
"<br>" +
"<em>3.6 Non-Profit Entity</em><br>" +
"A non-profit entity is an individual or organization which does NOT utilize TeamSpeak software for profit of any kind; be it monetary, from direct sales or rental fees, advertising profit, or intangible goods and services.<br>" +
"<br>" +
"Example 1: A clan or guild hosting a TeamSpeak server for their own private use while complying with all terms and conditions set forth in Section 5.1 of this Agreement. <br>" +
"<br>" +
"Example 2: An individual hosting a TeamSpeak server for private use to communicate with friends or family over the Internet while complying with all terms and conditions set forth in Section 5.1 of this Agreement.<br>" +
"<br>" +
"<strong>4. LICENSE FEES</strong><br>" +
"<br>" +
"Based on the definitions above, license fees may be applicable to entities utilizing the TeamSpeak Server application. License fees are NOT applicable to the TeamSpeak Client application. All Commercial Entities using the TeamSpeak Server application for any reason must pay a license fee, regardless of whether or not they choose to charge fees for the use of their servers. Non-Profit Entities using the TeamSpeak Server application do not need to pay a license fee; however, these entities must comply with the terms and conditions set forth in the License Types applicable to Non-Profit Entities below. If you are uncertain as to whether you qualify as a Non-Profit Entity you must contact TeamSpeak Systems, Inc. via e-mail at sales@teamspeakusa.com<script type='text/javascript'>" +
"/* <![CDATA[ */" +
"(function(){try{var s,a,i,j,r,c,l,b=document.getElementsByTagName('script');l=b[b.length-1].previousSibling;a=l.getAttribute('data-cfemail');if(a){s='';r=parseInt(a.substr(0,2),16);for(j=2;a.length-j;j+=2){c=parseInt(a.substr(j,2),16)^r;s+=String.fromCharCode(c);}s=document.createTextNode(s);l.parentNode.replaceChild(s,l);}}catch(e){}})();" +
"/* ]]> */" +
"</script> or via http://support.teamspeakusa.com.<br>" +
"<br>" +
"<strong>5. LICENSE TYPES</strong><br>" +
"<br>" +
"<em>5.1. Non-Profit License: Unregistered</em><br>" +
"This license type is for an individual or organization which is non-profit in nature, and does not require registration on our website nor a license key. An individual or organization operating under this license may install and use TeamSpeak software on one or more physical machines, without paying a license fee, provided that the following conditions are met:<ol class='letters'>" +
"<li>The individual or organization must be non-profit in nature. TeamSpeak Systems GmbH and TeamSpeak Systems, Inc. reserve the right to assess and determine if any individual or organization is non-profit in nature.<br>" +
"</li><li>The individual or organization may host up to 32 slots using only 1 Virtual Server for their entire operation. Exceeding the use of 32 slots or 1 Virtual Server over multiple physical machines operated by the same individual or organization is strictly prohibited.</li></ol><em>5.2. Non-Profit License: Registered</em><br>" +
"This license type is for an individual or organization which is non-profit in nature, and requires registration on our website and the use of a license key. An individual or organization operating under this license may install and use TeamSpeak software on one or more physical machines, without paying a license fee, provided that the following conditions are met:<ol class='letters'>" +
"<li>The individual or organization must register their operation and apply for this license type via TeamSpeak Systems, Inc.'s website at https://sales.teamspeakusa.com/users/register.php.<br>" +
"</li><li>The individual or organization must be non-profit in nature. TeamSpeak Systems GmbH and TeamSpeak Systems, Inc. reserve the right to assess and determine if any individual or organization is non-profit in nature.<br>" +
"</li><li>The individual or organization may host up to 512 slots using a maximum of 10 Virtual Servers for their entire operation. Any combination of slots or Virtual Servers over multiple physical machines is allowed, as long as the individual or organization does not exceed 512 slots or 10 Virtual Servers. This is also enforced by the license key which is issued after the registration and approval process has been completed.</li></ol><em>5.3. Commercial License for ATHPs (Authorized TeamSpeak Host Providers): Recurs Monthly</em><br>" +
"An Authorized TeamSpeak Host Provider License or ATHP License is a license requiring recurring monthly fees. ATHP Licenses are issued to Commercial Entities (an individual, company, or organization) which rent TeamSpeak servers to others for profit of any kind; be it monetary, from direct sales or rental fees, advertising profit, or through the privileged use of intangible goods and services. ATHPs are Commercial Entities which typically charge their customers a monthly fee for the use of a TeamSpeak Virtual Server or include the Virtual Server as part of other services or offerings to their customers free of charge. Commercial Entities operating under the Authorized TeamSpeak Host Provider License may install and use TeamSpeak software on one or more physical machines, and must adhere to the following conditions:<ol class='letters'>" +
"<li>ATHPs must register for an account on TeamSpeak Systems, Inc.'s website at https://sales.teamspeakusa.com/users/register.php.<br>" +
"</li><li>ATHPs are subject to recurring, monthly licensing fees based on the average slot count configured on each Virtual Server hosted by the ATHP during the previous month (e.g. - if a Virtual Server reports being configured for 50 Slots during 15 out of 30 days of the previous month, the Virtual Server will be billed at 25 Slots). These licensing fees are completely indifferent to whether or not an ATHP's customer makes use of their Virtual Server.<br>" +
"</li><li>ATHPs are billed monthly, in arrears, by TeamSpeak Systems, Inc. All invoices are typically sent on the 1st or 2nd day of every month via email and are also posted to the ATHP's online account via TeamSpeak Systems, Inc.'s website at http://sales.teamspeakusa.com.<br>" +
"</li><li>Payments are due 15 days after any invoice is generated (NET 15). It is the ATHP's responsibility to ensure that their invoice is received; whether by the primary email address registered to the ATHP's online account or by a representative of the ATHP ensuring that the ATHP's online account is logged into or checked each month for new invoices.<br>" +
"</li><li>ATHPs who become 30 or more days past due on their invoice may have their TeamSpeak Servers banned due to non-payment.<br>" +
"</li><li>ATHPs who consistently fail to pay their invoices on time are subject to having their account or license suspended or revoked.<br>" +
"</li><li>New ATHPs acknowledge that there will be a $50 setup fee in addition to a minimum monthly license fee of $25 for a minimum slot count of 200.<br>" +
"</li><li>ATHPs acknowledge that invoices may occasionally reflect inaccurate data due to incorrectly configured slot counts on licensed Virtual Servers (e.g. - test servers accidentally created with high slot counts, or duplicate data reported back to TeamSpeak Systems GmbH during data center migrations, etc.). As such, invoices are subject to review by both the ATHP and TeamSpeak Systems, Inc. Every effort will be made by TeamSpeak Systems, Inc. to determine the best course of action when correcting or modifying an invoice.<br>" +
"</li><li>ATHPs acknowledge that slot count data for each Virtual Server hosted by the ATHP is reported daily to TeamSpeak Systems GmbH's tracking server located at accounting.teamspeak.com (IP 80.190.145.215) for the purpose of tracking and billing the ATHP accordingly.<br>" +
"</li><li>ATHPs may not utilize firewalls or any other tools to prevent communication from their licensed Virtual Servers to TeamSpeak Systems GmbH's tracking server located at accounting.teamspeak.com (IP 80.190.145.215). All outbound traffic, both TCP and UDP, must be made available to the tracking server AND the organization must ensure that DNS is functioning properly and is able to resolve the hostname accounting.teamspeak.com at all times on all physical machines where Virtual Servers are being hosted.<br>" +
"</li><li>ATHPs may not alter each individual Virtual Server's slot count on a daily basis (e.g. - via an automated script or third party utility) in order to deliberately or otherwise alter the daily slot count configuration data which is reported to TeamSpeak Systems GmbH's tracking server located at accounting.teamspeak.com (IP 80.190.145.215).<br>" +
"</li><li>ATHPs may allow resellers to sell their TeamSpeak Virtual Servers; however, the ATHP must ensure that all of their Virtual Server IPs are licensed at all times. Resellers are not required to register and purchase a separate ATHP license for themselves as long as all Virtual Servers sold by the reseller are licensed through the ATHP.</li></ol><em>5.4. Commercial License: Annual Activation</em><br>" +
"A Commercial License is a license requiring annual activation. Commercial Licenses are issued to Commercial Entities (an individual, company, or organization) which utilize TeamSpeak servers in a commercial environment but are not in the business of hosting or renting servers to others for a recurring fee. Examples include, but are not limited to, Internet Cafes or small businesses using TeamSpeak for internal communication. Commercial Entities operating under the Commercial License must adhere to the following conditions:<ol class='letters'>" +
"<li>Commercial Entities must register for an account on TeamSpeak Systems, Inc.'s website at https://sales.teamspeakusa.com/users/register.php.<br>" +
"</li><li>Upon expiration of the annual licensed term, the Commercial Entity must purchase an additional year of activation in order to continue using TeamSpeak.<br>" +
"</li><li>Commercial Entities may utilize their license on multiple physical machines, provided the Commercial Entity abides by the limitations on its purchased slots and the maximum number of Virtual Servers for which they are licensed.<br>" +
"</li><li>Commercial Entities cannot re-sell any portion of their licensed slots or Virtual Servers to others for a recurring fee of any kind.</li></ol><em>5.5 Software Development Kit Integration License or 'SDK Integration License'</em><br>" +
"A Software Development Kit Integration License or SDK Integration License is a license which may require a one-time fee, recurring fees, or other pre-determined fees. SDK Integration Licenses are typically issued to Commercial Entities (an individual, company, or organization) which utilize TeamSpeak software to create customized or integrated applications as part of an existing product or service. Commercial Entities operating under the SDK Integration License must adhere to the following conditions:<ol class='letters'>" +
"<li>You may use the TeamSpeak SDK with only one product at a time. Any intent to utilize the TeamSpeak SDK with a different product will constitute a new Agreement, and new license fees may apply.<br>" +
"</li><li>You may NOT distribute, sell, lease, rent, lend, or sublicense any part of the TeamSpeak SDK to any third party without prior written consent from TeamSpeak Systems GmbH or TeamSpeak Systems, Inc.<br>" +
"</li><li>You may NOT use the TeamSpeak SDK to design or develop software to upload or otherwise transmit any material containing software viruses or other computer code, files or programs designed to interrupt, destroy, or limit the functionality of any software or hardware.<br>" +
"</li><li>You may NOT represent that the programs you develop using the TeamSpeak SDK are certified or otherwise endorsed by either TeamSpeak Systems GmbH or TeamSpeak Systems, Inc.<br>" +
"</li><li>You may NOT use the TeamSpeak name or any other trademarks of TeamSpeak Systems GmbH in connection with programs that you develop using the TeamSpeak SDK without prior written consent from TeamSpeak Systems GmbH or TeamSpeak Systems, Inc.</li></ol><strong>6. DISTRIBUTION VIA THE INTERNET</strong><br>" +
"<br>" +
"The preferred method of distribution of TeamSpeak software over the Internet is via TeamSpeak Systems GmbH's official website at www.TeamSpeak.com. You may not distribute TeamSpeak software otherwise over the Internet, unless you obtain prior written consent from TeamSpeak Systems GmbH or TeamSpeak Systems, Inc. to do so.<br>" +
"<br>" +
"<strong>7. THIRD PARTY DISTRIBUTION PROHIBITED</strong><br>" +
"<br>" +
"Distribution of TeamSpeak software by you to third parties (e.g. - publishers, magazines, third party products, etc.) is also hereby expressly prohibited unless you obtain prior written consent from TeamSpeak Systems GmbH or TeamSpeak Systems, Inc. to do so. <br>" +
"<br>" +
"<strong>8. TERMINATION</strong><br>" +
"<br>" +
"TeamSpeak Systems GmbH or TeamSpeak Systems, Inc. reserves the right to terminate your license for TeamSpeak software at any time or for any reason. Your license may also be terminated if you are in breach of any of the terms and conditions set forth in this Agreement. Upon termination, you shall immediately discontinue using TeamSpeak software and destroy all copies and related intellectual property in your possession, custody or control.<br>" +
"<br>" +
"<strong>9. BILLING</strong><br>" +
"<br>" +
"TeamSpeak Systems, Inc. is TeamSpeak Systems GmbH's official sales, licensing, and billing entity for TeamSpeak software. As such, all billing matters for Commercial Entities are handled by TeamSpeak Systems, Inc. Any inquiries relating to billing must be e-mailed to sales@teamspeakusa.com<script type='text/javascript'>" +
"/* <![CDATA[ */" +
"(function(){try{var s,a,i,j,r,c,l,b=document.getElementsByTagName('script');l=b[b.length-1].previousSibling;a=l.getAttribute('data-cfemail');if(a){s='';r=parseInt(a.substr(0,2),16);for(j=2;a.length-j;j+=2){c=parseInt(a.substr(j,2),16)^r;s+=String.fromCharCode(c);}s=document.createTextNode(s);l.parentNode.replaceChild(s,l);}}catch(e){}})();" +
"/* ]]> */" +
"</script> or submitted via TeamSpeak Systems, Inc.'s ticket system at http://support.teamspeakusa.com.<br>" +
"<br>" +
"<strong>10. PRICING</strong><br>" +
"<br>" +
"TeamSpeak software pricing information for Commercial Entities can be found on TeamSpeak Systems, Inc.'s website at http://sales.teamspeakusa.com/pricing.php.<br>" +
"<br>" +
"<strong>11. PROHIBITED CONDUCT</strong><br>" +
"<br>" +
"You represent and warrant that you will not violate any of the terms and conditions set forth in this Agreement and that:<ol class='letters'>" +
"<li>You will not: (I) reverse engineer, decompile, disassemble, derive the source code of, modify, or create derivative works from TeamSpeak software; or (II) use, copy, modify, alter, or transfer, electronically or otherwise, TeamSpeak software or any of the accompanying documentation except as expressly permitted in this Agreement; or (III) redistribute, sell, rent, lease, sublicense, or otherwise transfer rights to TeamSpeak software whether in a stand-alone configuration or as incorporated with other software code written by any party except as expressly permitted in this Agreement.<br>" +
"</li><li>You will not use TeamSpeak software to engage in or allow others to engage in any illegal activity.<br>" +
"</li><li>You will not engage in use of TeamSpeak software that will interfere with or damage the operation of the services of third parties by overburdening or disabling network resources through automated queries, excessive usage or similar conduct.<br>" +
"</li><li>You will not use TeamSpeak software to engage in any activity that will violate the rights of third parties, including, without limitation, through the use, public display, public performance, reproduction, distribution, or modification of communications or materials that infringe copyrights, trademarks, publicity rights, privacy rights, other proprietary rights, or rights against defamation of third parties.<br>" +
"</li><li>You will not transfer TeamSpeak software or utilize TeamSpeak software in combination with third party software authored by you or others to create an integrated software program which you transfer to unrelated third parties unless you obtain prior written consent from TeamSpeak Systems GmbH or TeamSpeak Systems, Inc. to do so.</li></ol><br>" +
"<strong>12. UPGRADES, UPDATES AND ENHANCEMENTS</strong><br>" +
"<br>" +
"All upgrades, updates or enhancements of TeamSpeak software shall be deemed to be part of TeamSpeak software and will be subject to this Agreement.<br>" +
"<br>" +
"<strong>13. LEGENDS AND NOTICES</strong><br>" +
"<br>" +
"You agree that you will not remove or alter any trademark, logo, copyright or other proprietary notices, legends, symbols or labels in TeamSpeak software or any accompanying documentation.<br>" +
"<br>" +
"<strong>14. TERM AND TERMINATION</strong><br>" +
"<br>" +
"This Agreement is effective upon your acceptance as provided herein and will remain in force until terminated. Non-Profit Entities may terminate the licenses granted in this Agreement at any time by destroying TeamSpeak software and any accompanying documentation, together with any and all copies thereof. Commercial Entities may terminate the licenses granted in this Agreement at any time by contacting TeamSpeak Systems, Inc. via e-mail at sales@teamspeakusa.com<script type='text/javascript'>" +
"/* <![CDATA[ */" +
"(function(){try{var s,a,i,j,r,c,l,b=document.getElementsByTagName('script');l=b[b.length-1].previousSibling;a=l.getAttribute('data-cfemail');if(a){s='';r=parseInt(a.substr(0,2),16);for(j=2;a.length-j;j+=2){c=parseInt(a.substr(j,2),16)^r;s+=String.fromCharCode(c);}s=document.createTextNode(s);l.parentNode.replaceChild(s,l);}}catch(e){}})();" +
"/* ]]> */" +
"</script> or via http://support.teamspeakusa.com. The licenses granted in this Agreement will terminate automatically if you breach any of its terms or conditions or any of the terms or conditions of any other agreement between you and TeamSpeak Systems GmbH or TeamSpeak Systems, Inc.<br>" +
"<br>" +
"<strong>15. SOFTWARE SUGGESTIONS</strong><br>" +
"<br>" +
"TeamSpeak Systems GmbH welcomes suggestions for enhancing TeamSpeak software and any accompanying documentation that may result in computer programs, reports, presentations, documents, ideas or inventions relating or useful to TeamSpeak Systems GmbH's business. You acknowledge that all title, ownership rights, and intellectual property rights concerning such suggestions shall become the exclusive property of TeamSpeak Systems GmbH and may be used for its business purposes in its sole discretion without any payment or accounting to you.<br>" +
"<br>" +
"<strong>16. MISCELLANEOUS</strong><br>" +
"<br>" +
"This Agreement constitutes the entire agreement between the parties concerning TeamSpeak software, and is subject to change by TeamSpeak Systems GmbH or TeamSpeak Systems, Inc. at any time. If any provision in this Agreement should be held illegal or unenforceable by a court of competent jurisdiction, such provision shall be modified to the extent necessary to render it enforceable without losing its intent, or severed from this Agreement if no such modification is possible, and other provisions of this Agreement shall remain in full force and effect. A waiver by either party of any term or condition of this Agreement or any breach thereof, in any one instance, shall not waive such term or condition or any subsequent breach thereof.<br>" +
"<br>" +
"<strong>17. DISCLAIMER OF WARRANTY</strong><br>" +
"<br>" +
"TEAMSPEAK SOFTWARE IS PROVIDED ON AN 'AS IS' BASIS, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING, WITHOUT LIMITATION, THE WARRANTIES THAT IT IS FREE OF DEFECTS, VIRUS FREE, ABLE TO OPERATE ON AN UNINTERRUPTED BASIS, MERCHANTABLE, FIT FOR A PARTICULAR PURPOSE OR NON-INFRINGING. THIS DISCLAIMER OF WARRANTY CONSTITUTES AN ESSENTIAL PART OF THIS LICENSE AND AGREEMENT. NO USE OF TEAMSPEAK SOFTWARE IS AUTHORIZED HEREUNDER EXCEPT UNDER THIS DISCLAIMER.<br>" +
"<br>" +
"<strong>18. LIMITATION OF LIABILITY</strong><br>" +
"<br>" +
"TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT WILL TEAMSPEAK SYSTEMS GMBH NOR TEAMSPEAK SYSTEMS, INC. BE LIABLE FOR ANY INDIRECT, SPECIAL, INCIDENTAL OR CONSEQUENTIAL DAMAGES ARISING OUT OF THE USE OF OR INABILITY TO USE TEAMSPEAK SOFTWARE, INCLUDING, WITHOUT LIMITATION, DAMAGES FOR LOST PROFITS, LOSS OF GOODWILL, WORK STOPPAGE, COMPUTER FAILURE OR MALFUNCTION, OR ANY AND ALL OTHER COMMERCIAL DAMAGES OR LOSSES, EVEN IF ADVISED OF THE POSSIBILITY THEREOF, AND REGARDLESS OF THE LEGAL OR EQUITABLE THEORY (CONTRACT, TORT OR OTHERWISE) UPON WHICH THE CLAIM IS BASED. IN ANY CASE, TEAMSPEAK SYSTEMS' OR TEAMSPEAK SYSTEMS, INC.'S COLLECTIVE LIABILITY UNDER ANY PROVISION OF THIS LICENSE SHALL NOT EXCEED IN THE AGGREGATE THE SUM OF THE FEES (IF ANY) YOU PAID FOR THIS LICENSE.<br>" +
"</div>"),
                        buttons : Ext.Msg.YESNO,
                        fn      : function(answer) {
                            if (answer !== "yes")
                               return;

                            OMV.Rpc.request({
                                scope   : me,
                                rpcData : {
                                    service : "Teamspeak3",
                                    method  : "doUpdateEULA",
                                },
                                success : function(id, success, response) {
                                    me.doReload();
                                    OMV.MessageBox.hide();
                                }
                            });
                        },
                        scope : me,
                        icon  : Ext.Msg.QUESTION
                    });
                },
                     margin : "5 5 5 5"
            },{
                border : false,
                html   : "<ul><li>" + ("After you agree to the EUL, please wait a few seconds for TS to setup.") + "</li></ul>"
            }]
        }];
    },
});

OMV.WorkspaceManager.registerPanel({
    id        : "settings",
    path      : "/service/teamspeak3",
    text      : _("Settings"),
    position  : 10,
    className : "OMV.module.admin.service.teamspeak3.Settings"
});
