<?php

namespace App\Support;

class Fee
{
    public static function grossForCardCents(int $netCents, float $percent = 0.029, int $fixedCents = 30): int
    {
        return (int) ceil(($netCents + $fixedCents) / (1 - $percent));
    }

    public static function grossForAchCents(int $netCents, float $percent = 0.008, int $capCents = 500): int
    {
        $uncappedGross = (int) ceil($netCents / (1 - $percent));
        $uncappedFee   = (int) ceil($uncappedGross * $percent);

        if ($uncappedFee <= $capCents) {
            return $uncappedGross;
        }

        return $netCents + $capCents;
    }
}
