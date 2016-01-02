<?php

/**
 * Copyright (C) 2013-2014 OpenMediaVault Plugin Developers
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

require_once "openmediavault/config.inc";
require_once "openmediavault/error.inc";
require_once "openmediavault/notify.inc";
require_once "openmediavault/object.inc";
require_once "openmediavault/product.inc";
require_once "openmediavault/rpcservice.inc";
require_once "openmediavault/system.inc";
require_once "openmediavault/util.inc";

class OMVRpcServiceTeamspeak3 extends OMVRpcServiceAbstract
{
    private function getPluginName()
    {
        return strtolower($this->getName());
    }

    private function getEventMessagePath()
    {
        return sprintf("org.openmediavault.service.%s", $this->getPluginName());
    }

    private function getXPath()
    {
        return sprintf(" /config/services/%s", $this->getPluginName());
    }

    public function getName()
    {
        return "Teamspeak3";
    }

    public function initialize()
    {
        $this->registerMethod("getSettings");
        $this->registerMethod("setSettings");
        $this->registerMethod('doUpdateTS3');
        $this->registerMethod('doUpdateEULA');
    }

    public function getSettings($params, $context)
    {
        $this->exec("omv-mkconf "
             . $this->getPluginName()
             . " getsettings 2>&1");
        
        global $xmlConfig;

        $this->validateMethodContext($context, array(
            "role" => OMV_ROLE_ADMINISTRATOR
        ));

        $object = $xmlConfig->get($this->getXPath());

        if (is_null($object)) {
            throw new OMVException(
                OMVErrorMsg::E_CONFIG_GET_OBJECT_FAILED,
                $this->getXPath()
            );
        }

        $object["enable"]	= boolval($object["enable"]);
        $object["showtab"]	= boolval($object["showtab"]);
        $object["update"]	= boolval($object["update"]);
        $object["enablewi"]     = boolval($object["enablewi"]);

        return $object;
    }

    public function setSettings($params, $context)
    {
        global $xmlConfig;

        $this->validateMethodContext($context, array(
            "role" => OMV_ROLE_ADMINISTRATOR
        ));

        $this->validateMethodParams(
            $params,
            '{
                "type"       : "object",
                "properties" : {
                    "enable"     : { "type" : "boolean" },
                    "showtab"    : { "type" : "boolean" },
                    "update"     : { "type" : "boolean" },
                    "password"   : { "type" : "string" },
                    "queryport"  : { "type" : "integer","minimum":1,"maximum":65535 },
                    "vsport"     : { "type" : "integer","minimum":1,"maximum":65535 },
                    "fileport"   : { "type" : "integer","minimum":1,"maximum":65535 },
                    "restartmsg" : { "type" : "string" },
                    "eula"       : { "type" : "boolean" },
                    "enablewi"   : { "type" : "boolean" },
                    "languagewi" : { "type" : "string" }

                }
            }'
        );


        // Get existing configuration object
        $oldObject = $xmlConfig->get($this->getXPath());

        if (is_null($oldObject)) {
            throw new OMVException(
                OMVErrorMsg::E_CONFIG_GET_OBJECT_FAILED,
                $this->getXPath()
            );
        }

        $object = array(
            "enable"      => array_boolval($params, "enable"),
            "showtab"     => array_boolval($params, "showtab"),
            "update"      => array_boolval($params, "update"),
            "password"    => $params["password"],
            "queryport"   => $params["queryport"],
            "vsport"      => $params["vsport"],
            "fileport"    => $params["fileport"],
            "restartmsg"  => $params["restartmsg"],
            "eula"        => array_boolval($params, "eula"),
            "enablewi"    => array_boolval($params, "enablewi"),
            "langquagewi" => $params["languagewi"],
        );

        if (false === $xmlConfig->replace($this->getXPath(), $object)) {
            throw new OMVException(
                OMVErrorMsg::E_CONFIG_SET_OBJECT_FAILED,
                $this->getXPath()
            );
        }

        $dispatcher = &OMVNotifyDispatcher::getInstance();
        $dispatcher->notify(
            OMV_NOTIFY_MODIFY,
            $this->getEventMessagePath(),
            $object
        );

        return $object;
    }

    public function doUpdateTS3($params, $context)
    {
        $cmd = sprintf("omv-mkconf %s update 2>&1", $this->getPluginName());

        if (0 !== $this->exec($cmd, $output)) {
            throw new OMVException(
                OMVErrorMsg::E_EXEC_FAILED,
                $cmd,
                implode(PHP_EOL, $output)
            );
        }

        $dispatcher = &OMVNotifyDispatcher::getInstance();
        $dispatcher->notify(
            OMV_NOTIFY_MODIFY,
            $this->getEventMessagePath(),
            $object
        );
    }

    public function doUpdateEULA($params, $context) {
        $cmd = sprintf("omv-mkconf %s eula 2>&1", $this->getPluginName());

        if (0 !== $this->exec($cmd, $output)) {
            throw new OMVException(
                OMVErrorMsg::E_EXEC_FAILED,
                $cmd,
                implode(PHP_EOL, $output)
            );
        }
    }
}

// Register the RPC service.
$rpcServiceMgr = &OMVRpcServiceMgr::getInstance();
$rpcServiceMgr->registerService(new OMVRpcServiceTeamspeak3());
