import {UserService} from "./UserService.ts";
import {User} from "../model/userTypes.ts";
import {UserFilePersistenceService} from "./userFilePersistenceService.ts";
import fs from "fs";
import {myLogger} from "../utils/logger.ts";

export  class UserServiceEmbeddedImpl implements UserService, UserFilePersistenceService{
    private users: User[] = [];
    private rs = fs.createReadStream('data.txt', {encoding: 'utf8', highWaterMark: 24});

    addUser(user: User): boolean {
        if(this.users.findIndex((u:User) => u.id === user.id) === -1)
        {
            this.users.push(user);
            return true;
        }
        return false;
    }

    getAllUsers(): User[] {
        return [...this.users];
    }

    getUserById(id: number): User {
       const user = this.users.find(item => item.id === id);
       if(!user) throw "404";
        return user;
    }

    removeUser(id: number): User {
        const index = this.users.findIndex(item => item.id === id);
        if(index === -1) throw "404";
        const removed = this.users[index];
        this.users.splice(index, 1);
        return removed;
    }

    updateUser(newUser: User): void {
        const index = this.users.findIndex(item => item.id === newUser.id);
        if(index === -1) throw "404";
        this.users[index] = newUser;
    }

    async restoreDataFromFile(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            let result: string = "";
            this.rs.on('data', (chunk) => {
                if(chunk) {
                    result += chunk.toString();
                }
                else {
                    result = "[]";
                }
            })
            this.rs.on('end', () => {
                if(result) {
                    this.users = JSON.parse(result);
                    myLogger.log("Data was restored from file");
                    myLogger.save("Data was restored from file");
                    this.rs.close();
                    resolve();
                }
                else {
                    this.users = [{id: 123, userName: 'Grushin'}]
                    resolve();
                }
            })

            this.rs.on('error', () => {
                this.users = [{id: 2, userName: 'Bender'}]
                myLogger.log("File to restore not found");
                reject()
            })
        })

    }

    async saveDataToFile(): Promise<void> {
        return new Promise((resolve, reject) => {
            const ws = fs.createWriteStream('data.txt')
            const data = JSON.stringify(this.users);
            ws.write(data);
            ws.on('end', () => {
                myLogger.log("Data was saved to file");
                myLogger.save("Data was saved to file");
                ws.close();
                resolve();
            })
            ws.on('error', () => {
                myLogger.log("error: data not saved")
                reject()
            })
        })

    }
}