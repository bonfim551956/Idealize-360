import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { MapPin, Briefcase, Clock, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { listOpenJobs } from "@/lib/api/jobs";
import { listUnits } from "@/lib/api/units";

export default function PublicJobs() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUnit, setSelectedUnit] = useState<string>("all");

  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ["open-jobs"],
    queryFn: listOpenJobs,
  });
  const { data: units = [] } = useQuery({
    queryKey: ["units"],
    queryFn: listUnits,
  });

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesUnit = selectedUnit === "all" || job.unit?.id === selectedUnit;
    return matchesSearch && matchesUnit && job.status === "open";
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-hero text-primary-foreground">
        <div className="container mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="mb-6 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-foreground/20 backdrop-blur">
                <span className="text-3xl font-bold">i</span>
              </div>
            </div>
            <h1 className="mb-4 text-4xl font-bold md:text-5xl">
              Trabalhe na Idealize
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-primary-foreground/80">
              Faça parte de uma das maiores redes de óticas do Brasil. 
              Encontre a vaga ideal para você e inicie sua jornada conosco.
            </p>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mx-auto mt-8 max-w-3xl"
          >
            <div className="flex flex-col gap-4 rounded-2xl bg-primary-foreground/10 p-4 backdrop-blur md:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-primary-foreground/60" />
                <Input
                  placeholder="Buscar vagas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-12 border-0 bg-primary-foreground/20 pl-10 text-primary-foreground placeholder:text-primary-foreground/60"
                />
              </div>
              <Select value={selectedUnit} onValueChange={setSelectedUnit}>
                <SelectTrigger className="h-12 w-full border-0 bg-primary-foreground/20 text-primary-foreground md:w-[200px]">
                  <SelectValue placeholder="Todas as unidades" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as unidades</SelectItem>
                  {units.map((unit) => (
                    <SelectItem key={unit.id} value={unit.id}>
                      {unit.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Jobs List */}
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-bold">
            {filteredJobs.length} vaga{filteredJobs.length !== 1 && "s"} disponíve
            {filteredJobs.length !== 1 ? "is" : "l"}
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredJobs.map((job, index) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full transition-shadow hover:shadow-lg">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-semibold">{job.title}</h3>
                      <div className="mt-2 flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span className="text-sm">{job.unit?.city ?? ""}</span>
                      </div>
                    </div>
                    <Badge variant="secondary">{job.type}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="line-clamp-3 text-muted-foreground">
                    {job.description}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {job.requirements.slice(0, 2).map((req, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {req}
                      </Badge>
                    ))}
                    {job.requirements.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{job.requirements.length - 2}
                      </Badge>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex items-center justify-between border-t pt-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{job.applications} candidaturas</span>
                  </div>
                  <Button asChild>
                    <Link to={`/careers/${job.id}`}>Ver vaga</Link>
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>

        {isLoading && (
          <div className="py-12 text-center text-muted-foreground">
            Carregando vagas...
          </div>
        )}

        {!isLoading && filteredJobs.length === 0 && (
          <div className="py-12 text-center">
            <Briefcase className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">Nenhuma vaga encontrada</h3>
            <p className="mt-2 text-muted-foreground">
              Tente ajustar seus filtros ou cadastre-se para receber alertas de novas vagas.
            </p>
            <Button className="mt-4" asChild>
              <Link to="/careers/register">Cadastrar currículo</Link>
            </Button>
          </div>
        )}

        {/* CTA Section */}
        <div className="mt-16 rounded-2xl bg-gradient-primary p-8 text-center text-primary-foreground md:p-12">
          <h2 className="text-2xl font-bold md:text-3xl">
            Não encontrou a vaga ideal?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-primary-foreground/80">
            Cadastre seu currículo em nosso banco de talentos e seja notificado quando 
            surgir uma oportunidade que combine com seu perfil.
          </p>
          <Button
            size="lg"
            variant="secondary"
            className="mt-6"
            asChild
          >
            <Link to="/careers/register">Cadastrar no Banco de Talentos</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
