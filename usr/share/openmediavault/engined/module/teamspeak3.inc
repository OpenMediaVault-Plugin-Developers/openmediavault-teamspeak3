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

// class OMVModuleTeamspeak3 extends OMVModuleServiceAbstract implements
//     OMVINotifyListener,
//     OMVIModuleServiceStatus
class OMVModuleTeamspeak3 extends \OMV\Engine\Module\ServiceAbstract implements
    \OMV\Engine\Notify\IListener, \OMV\Engine\Module\IServiceStatus
{
    // private function getPluginName()
    // {
    //     return strtolower($this->getName());
    // }

    // private function getEventMessagePath()
    // {
    //     return sprintf("org.openmediavault.service.%s", $this->getPluginName());
    // }

    // private function getXPath()
    // {
    //     return sprintf(" /config/services/%s", $this->getPluginName());
    // }

    public function getName()
    {
        return "Teamspeak3";
    }

    public function applyConfig()
    {
        $cmd = new \OMV\System\Process("omv-mkconf", "teamspeak3", "firstrun");
        $cmd->setRedirect2to1();
        $cmd->execute();


        // $cmd = sprintf("omv-mkconf %s firstrun 2>&1", $this->getPluginName());

        // if (0 !== $this->exec($cmd, $output)) {
        //     throw new OMVException(
        //         OMVErrorMsg::E_EXEC_FAILED,
        //         $cmd,
        //         implode(PHP_EOL, $output)
        //     );
        // }
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

        // global $xmlConfig;

        // $object = $xmlConfig->get($this->getXPath());

        // if (is_null($object)) {
        //     throw new OMVException(
        //         OMVErrorMsg::E_CONFIG_GET_OBJECT_FAILED,
        //         $this->getXPath()
        //     );
        // }

        // $systemCtl = new OMVSystemCtl($this->getPluginName());

        // return array(
        //     "name"    => $this->getName(),
        //     "title"   => gettext("TeamSpeak 3"),
        //     "enabled" => boolval($object["enable"]),
        //     "running" => $systemCtl->isActive()
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

        // global $xmlConfig;

        // $object = $xmlConfig->get($this->getXPath());

        // if (is_null($object)) {
        //     throw new OMVException(
        //         OMVErrorMsg::E_CONFIG_GET_OBJECT_FAILED,
        //         $this->getXPath()
        //     );
        // }

        // if (!boolval($object["enable"])) {
        //     return;
        // }

        // // Use below or the $cmd way?
        // $systemCtl = new OMVSystemCtl($this->getPluginName());
        // $systemCtl->enable(true);

        // //$cmd = "sudo -u ts3 /etc/init.d/teamspeak3 start && update-rc.d teamspeak3 enable > /dev/null";

        // //if (0 !== $this->exec($cmd, $output)) {
        // //    throw new OMVException(
        // //        OMVErrorMsg::E_EXEC_FAILED,
        // //        $cmd,
        // //        implode(PHP_EOL, $output)
        // //    );
        // //}
    }

    public function stopService()
    {
        $systemCtl = new \OMV\System\SystemCtl("teamspeak3");
        $systemCtl->disable(TRUE);
        // $systemCtl = new OMVSystemCtl($this->getPluginName());
        // $systemCtl->disable(true);
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

        // $moduleMgr = &OMVModuleMgre::getInstance();

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

        // $moduleMgr = &OMVModuleMgr::getInstance();

        // $dispatcher->addListener(
        //     OMV_NOTIFY_MODIFY,
        //     $this->getEventMessagePath(),
        //     array($this, "setDirty")
        // );

        // $dispatcher->addListener(
        //     OMV_NOTIFY_MODIFY,
        //     $this->getEventMessagePath(),
        //     array($moduleMgr->getModule("php5fpm"), "setDirty")
        // );

        // $dispatcher->addListener(
        //     OMV_NOTIFY_MODIFY,
        //     $this->getEventMessagePath(),
        //     array($moduleMgr->getModule("webserver"), "setDirty")
        // );
    }
}

// // Register module
// $moduleMgr = &OMVModuleMgr::getInstance();
// $moduleMgr->registerModule(new OMVModuleTeamspeak3());

