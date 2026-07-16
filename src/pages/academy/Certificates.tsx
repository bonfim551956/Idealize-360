import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Award, Download, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { listCertificates } from "@/lib/api/enrollments";

export default function Certificates() {
  const { data: certificates = [], isLoading } = useQuery({
    queryKey: ["certificates"],
    queryFn: listCertificates,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Certificados</h1>
        <p className="text-muted-foreground">
          Certificados emitidos ao concluir as trilhas da Idealize Academy
        </p>
      </div>

      {isLoading && (
        <p className="py-10 text-center text-muted-foreground">Carregando certificados...</p>
      )}

      {!isLoading && certificates.length === 0 && (
        <div className="py-12 text-center">
          <Award className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">Nenhum certificado ainda</h3>
          <p className="mt-2 text-muted-foreground">
            Os certificados aparecem aqui quando os colaboradores concluem os cursos.
          </p>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {certificates.map((cert, index) => (
          <motion.div
            key={cert.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="overflow-hidden">
              <div className="flex items-center justify-center bg-gradient-primary py-8 text-primary-foreground">
                <Award className="h-12 w-12" />
              </div>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>
                      {cert.employeeName.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{cert.employeeName}</p>
                    <p className="text-sm text-muted-foreground">{cert.courseTitle}</p>
                  </div>
                </div>
                {cert.completedAt && (
                  <p className="mt-3 text-sm text-muted-foreground">
                    Concluído em{" "}
                    {new Date(cert.completedAt).toLocaleDateString("pt-BR")}
                  </p>
                )}
                {cert.certificateUrl && (
                  <Button variant="outline" size="sm" className="mt-4 w-full gap-2" asChild>
                    <a href={cert.certificateUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                      Ver certificado
                    </a>
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
