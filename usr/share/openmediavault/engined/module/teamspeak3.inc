<?php
/**
 * @license http://www.gnu.org/licenses/gpl.html GPL Version 3
 * @author Volker Theile <volker.theile@openmediavault.org>
 * @author OpenMediaVault Plugin Developers <plugins@omvextras.org>
 * @copyright Copyright (c) 2009-2013 Volker Theile
 * @copyright Copyright (c) 2013-2017 OpenMediaVault Plugin Developers
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

// require_once "openmediavault/config.inc";
// require_once "openmediavault/error.inc";
// require_once "openmediavault/systemctl.inc";
// require_once "openmediavault/module.inc";
// require_once "openmediavault/util.inc";

class OMVModuleTeamspeak3 extends \OMV\Engine\Module\ServiceAbstract implements
    \OMV\Engine\Notify\IListener, \OMV\Engine\Module\IServiceStatus
{
    public function getName()
    {
        return "Teamspeak3";
    }

    public function applyConfig()
    {
        $cmd = new \OMV\System\Process("omv-mkconf", "teamspeak3", "firstrun");
        $cmd->setRedirect2to1();
        $cmd->execute();
    }

    public function getStatus()
    {
        $db = \OMV\Config\Database::getInstance();
        $object = $db->get("conf.service.teamspeak3");
        $systemCtl = new \OMV\System\SystemCtl("teamspeak3");
        return array(
            "name" => $this->getName(),
            "title" => gettext("teamspeak3"),
            "enabled" => $object->get("enable"),
            "running" => $systemCtl->isActive()
        );
    }

    public function startService()
    {
        // Check to see if plugin is enabled
        $db = \OMV\Config\Database::getInstance();
        $object = $db->get("conf.service.teamspeak3");
        if (TRUE !== $object->get("enable"))
            return;
        // Start this service and enable the unit file.
        $systemCtl = new \OMV\System\SystemCtl("teamspeak3");
        $systemCtl->enable(TRUE);
    }

    public function stopService()
    {
        $systemCtl = new \OMV\System\SystemCtl("teamspeak3");
        $systemCtl->disable(TRUE);
    }

    public function bindListeners(\OMV\Engine\Notify\Dispatcher $dispatcher)
    // public function bindListeners(OMVNotifyDispatcher $dispatcher)
    {
        // This will notify OMV of changes for each configuration type 
        // and the level to notify.
        $dispatcher->addListener(
            OMV_NOTIFY_MODIFY,
            "org.openmediavault.conf.service.teamspeak3",
            [ $this, "setDirty" ]
        );

        $moduleMgr = \OMV\Engine\Module\Manager::getInstance();

        $dispatcher->addListener(
            OMV_NOTIFY_MODIFY,
            "org.openmediavault.conf.service.teamspeak3",
            [ $moduleMgr->getModule("php5fpm"), "setDirty" ]
        );

        $dispatcher->addListener(
            OMV_NOTIFY_MODIFY,
            "org.openmediavault.conf.service.teamspeak3",
            [ $moduleMgr->getModule("webserver"), "setDirty" ]
        );
    }
}
