import React from 'react';
import UserDetailsCard from '../atoms/UserCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../atoms/Tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../atoms/Card';
import { Button } from '@a-little-world/little-world-design-system';

const UserPanel = () => {
    return (
        <div>
            <Tabs defaultValue="account" className="w-[400px]">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="password">Password</TabsTrigger>
      </TabsList>
      <TabsContent value="account">
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>
              Make changes to your account here. Click save when you're done.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="space-y-1">
              Content1
            </div>
            <div className="space-y-1">
              Content2
            </div>
          </CardContent>
          <CardFooter>
            <Button>Save changes</Button>
          </CardFooter>
        </Card>
      </TabsContent>
      <TabsContent value="password">
        <Card>
          <CardHeader>
            <CardTitle>Password</CardTitle>
            <CardDescription>
              Change your password here. After saving, you'll be logged out.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="space-y-1">
              Content 1
            </div>
            <div className="space-y-1">
              Content 2
            </div>
          </CardContent>
          <CardFooter>
            <Button>Save password</Button>
          </CardFooter>
        </Card>
      </TabsContent>
    </Tabs>
            {/* <UserDetailsCard /> */}
        </div>
    )
}

export default UserPanel