import { motion } from "framer-motion";
import { Trophy, Medal, TrendingUp, Users, Building2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { employees, units } from "@/lib/mock-data";

const rankingEmployees = [...employees].sort((a, b) => b.performance - a.performance);

const unitRanking = units.map((unit) => {
  const unitEmployees = employees.filter((e) => e.unit.id === unit.id);
  const avgPerformance =
    unitEmployees.length > 0
      ? Math.round(unitEmployees.reduce((acc, e) => acc + e.performance, 0) / unitEmployees.length)
      : 0;
  return {
    ...unit,
    avgPerformance,
    employeeCount: unitEmployees.length,
  };
}).sort((a, b) => b.avgPerformance - a.avgPerformance);

export default function Ranking() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Ranking</h1>
        <p className="text-muted-foreground">
          Acompanhe os top performers da rede Idealize
        </p>
      </div>

      <Tabs defaultValue="employees" className="space-y-6">
        <TabsList>
          <TabsTrigger value="employees" className="gap-2">
            <Users className="h-4 w-4" />
            Colaboradores
          </TabsTrigger>
          <TabsTrigger value="units" className="gap-2">
            <Building2 className="h-4 w-4" />
            Unidades
          </TabsTrigger>
        </TabsList>

        {/* Employees Ranking */}
        <TabsContent value="employees" className="space-y-6">
          {/* Top 3 */}
          <div className="grid gap-4 md:grid-cols-3">
            {rankingEmployees.slice(0, 3).map((employee, index) => (
              <motion.div
                key={employee.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  className={
                    index === 0
                      ? "border-2 border-warning bg-warning/5"
                      : index === 1
                      ? "border-2 border-muted-foreground/50"
                      : "border-2 border-orange-400"
                  }
                >
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="relative mx-auto w-fit">
                        <Avatar className="h-20 w-20">
                          <AvatarImage src={employee.avatar} />
                          <AvatarFallback className="text-xl">
                            {employee.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div
                          className={`absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full ${
                            index === 0
                              ? "bg-warning text-warning-foreground"
                              : index === 1
                              ? "bg-muted-foreground text-muted"
                              : "bg-orange-400 text-primary-foreground"
                          }`}
                        >
                          {index === 0 ? (
                            <Trophy className="h-4 w-4" />
                          ) : (
                            <Medal className="h-4 w-4" />
                          )}
                        </div>
                      </div>
                      <h3 className="mt-4 text-lg font-semibold">{employee.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {employee.role.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {employee.unit.name}
                      </p>
                      <div className="mt-4">
                        <div className="text-4xl font-bold text-primary">
                          {employee.performance}%
                        </div>
                        <p className="text-sm text-muted-foreground">Performance</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Rest of Ranking */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-success" />
                Ranking Completo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {rankingEmployees.slice(3).map((employee, index) => (
                  <motion.div
                    key={employee.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: (index + 3) * 0.05 }}
                    className="flex items-center gap-4 rounded-lg border border-border p-4"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted font-bold">
                      {index + 4}
                    </div>
                    <Avatar>
                      <AvatarImage src={employee.avatar} />
                      <AvatarFallback>
                        {employee.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">{employee.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {employee.role.name} • {employee.unit.name}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-32">
                        <Progress value={employee.performance} className="h-2" />
                      </div>
                      <div className="w-16 text-right font-bold">
                        {employee.performance}%
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Units Ranking */}
        <TabsContent value="units" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {unitRanking.map((unit, index) => (
              <motion.div
                key={unit.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  className={
                    index === 0 ? "border-2 border-warning bg-warning/5" : ""
                  }
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          {index === 0 && <Trophy className="h-5 w-5 text-warning" />}
                          <Badge variant="outline">#{index + 1}</Badge>
                        </div>
                        <h3 className="mt-2 text-lg font-semibold">{unit.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {unit.city}, {unit.state}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-primary">
                          {unit.avgPerformance}%
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Média de performance
                        </p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <Progress value={unit.avgPerformance} className="h-2" />
                    </div>
                    <div className="mt-4 flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Colaboradores</span>
                      <span className="font-medium">{unit.employeeCount}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Gestor</span>
                      <span className="font-medium">{unit.manager}</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
