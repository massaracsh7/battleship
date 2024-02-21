import DataBase from "../db/database";
import GameSocket from "../game/gameSocket";
import { Player } from "../types/types";

export default class Manager { 
  public regHandler(player: Player, database: DataBase, socket: GameSocket): string {

    let result: Player = database.findUser(player);

    if (!result) {
      result = database.setUser(player, socket);
    }

    if (!database.checkUserForLogin(player)) {
      const err = {
        name: player.name,
        index: -1,
        error: true,
        errorText: 'Wrong player data'
      };
      return new CreateResponse(TypesOfData.REG, JSON.stringify(err), -1).getResponse();
    }

    return new CreateResponse(TypesOfData.REG, JSON.stringify(result.getRegData()), result.getIndexUser()).getResponse();
  }

}